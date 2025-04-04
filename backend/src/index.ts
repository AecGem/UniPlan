import dotenv from "dotenv";
dotenv.config();
import { Elysia, Context, t } from "elysia"; //Base server library
import { swagger } from "@elysiajs/swagger"; //Swagger documentation
import { jwt } from "@elysiajs/jwt"; //Javascript web tokens
import { cors } from "@elysiajs/cors"; //Cross origin resource sharing
import { cron } from "@elysiajs/cron"; //Cronjobs
import { AuthenticationError } from "./exceptions/AuthenticationError"; //Custom exceptions
import { AuthorizationError } from "./exceptions/AuthorizationError"; // ''
import { InvariantError } from "./exceptions/InvariantError"; // ''
import { staticPlugin } from "@elysiajs/static"; //Support for static serving
import { file } from "bun"; //File I/O?
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { auth } from "./utils/auth";
import { $ } from "bun";
import { rmSync } from 'fs';

const prisma = new PrismaClient();

//Authentication module
const betterAuthView = (context: Context) => {
    const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];

    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
        return auth.handler(context.request);
    } else {
        context.error(405, "Method not allowed");
    }
};

const app = new Elysia()

    //API endpoints

    //Verification endpoint
    .get("/api/verification", async ({query:{id, did}}) =>{
        //It's all in my head, but I want non-fiction.
        if (id===undefined || did===undefined){
            return {
                errors: 1,
                errorsList:{1: "RUNTIME_ERR: user id and degree id must not be undefined!"}
            };
        }
        else{
            //its like 199 degrees
            let response = "hai";
            let directory = '/var/www/temp/UniPlan/'.concat(id);
            await $`mkdir ${directory}`;
            await $`curl https://uniplanner.ca/api/degree_specific?didin=${did} -k > ${directory}/req.json`.nothrow();
            await $`curl https://uniplanner.ca/api/get_saved_sem?userid=${id} -k > ${directory}/sem.json`.nothrow();

            //when you're doin it with me, doin it with me~!
            await $`/var/www/UniPlan/backend/src/middleware/verifier ${directory}/req.json ${directory}/sem.json ${directory}/out.json`
            let file = Bun.file(`${directory}/out.json`);
            response = await file.json();
            rmSync(directory, { recursive: true, force: true });
            return response;
        }
        


        
    })

    //Course and Degree endpoints
    .get("/api/course", async ({ query: { id, isAmbig, didin } }) => {
        //Checkflags
        let id_undefined = false;
        let did_undefined = false;

        if(id===undefined){
            id_undefined = true;
        }
        if(didin===undefined){
            did_undefined = true;
        }

        let isAmbig_undefined = false;
        if (isAmbig === undefined) {
            isAmbig_undefined = true;
        }

        //Return value
        let courses = null;

        //Grab all.
        if (id_undefined && isAmbig_undefined && did_undefined) {
            courses = await prisma.course.findMany();
        }

        //Get only ambig courses
        else if (id_undefined && !(isAmbig_undefined) && did_undefined) {
            courses = await prisma.course.findMany(
                {
                    where: {
                        isambig: isAmbig
                    }

                }

            )
        }
        //Get only the required courses for a specific degree
        else if (id_undefined && isAmbig_undefined && !(did_undefined)) {
            //Sanitize ID
            let passedDId;
            if (didin !== undefined) {
                passedDId = parseInt(didin);
            }
            else {
                passedDId = -1;
            }
            const CourseList = await prisma.degree
                .findUnique({
                    where: { did: passedDId },
                    select: { courses: true },
                })
                .then(degree => degree?.courses || []);
            const result = await prisma.course.findMany({
                where: {
                    cid: {
                        in: CourseList,
                    },
                },
            });
            courses = result;

        }
        //Get only a specific ID

        else if (!(id_undefined) && isAmbig_undefined && did_undefined) {
            //Sanitize ID
            let passedId;
            if (id !== undefined) {
                passedId = parseInt(id);
            }
            else {
                passedId = -1;
            }
            courses = await prisma.course.findFirst({
                where: {
                    cid: passedId
                }
            })
        }

        return courses;
    },
    {
        query: t.Object({
            id: t.Optional(t.String()),
            isAmbig: t.Optional(t.Boolean()),
            didin: t.Optional(t.String())
        })
    })

    .post("/api/course_many", async ({ body: {cids} }) =>{
        const result = await prisma.course.findMany({
            where: {
                cid: {
                    in: cids,},
            },
            select: {
                cid: true,
                shortname: true,
                coursename: true,
                credits: true,
                description: true,
                prereq: true,
              }
        });
        return result;
    },
    {
        body: t.Object({
            cids: t.Optional(t.Array(t.Number()))
        })
    })

    .get("/api/degree", async () => {
        let degrees = null;
        degrees = await prisma.degree.findMany();
 
        return degrees
            
    })

    .get("/api/degree_specific", async ({query: {didin}}) =>{
        let passedDId;
        let degrees;
            if (didin !== undefined) {
                passedDId = parseInt(didin);
            }
            else {
                passedDId = -1;
            }
            degrees = await prisma.degree.findFirst({
                where: {
                    did: passedDId,
                }
            });
        
        return degrees;
    },{
        query: t.Object({
        didin: t.Optional(t.String())
        })
    })

    .get("/api/update_user_degree", async ({query: {userid, didin}}) => {
        const updateUserDegree = await prisma.user.update({
            where: {
                id: userid
            },
            data: {
                did: parseInt(didin)
            },
        });
        return updateUserDegree;
    },{
        query: t.Object({
         didin: t.Optional(t.Number()),
         userid: t.Optional(t.String())
        })
    })

    .post("/api/createSemester", async ({ body: {userid, name} }) => {
        const newSem = await prisma.saved_sem.create({
            data: {
            u_id: userid,
            sname: name,
            courses: []
            },
        });
    
        return newSem;
    },{
        body: t.Object({
            userid: t.Optional(t.String()),
            name: t.Optional(t.String())
        })
    })

    .post("/api/saveSemester", async({body: {semId, name, course_list, userid }}) =>{
        
        const sem = await prisma.saved_sem.update({
            where: {
                sem_id: semId
            },
            data: {
            courses: course_list,
            sname: name
            },
            });
            const updateUserSave = await prisma.user.update({
                where: {
                    id: userid
                },
                data: {
                    hassaved: true
                }
            });
            return sem;      
        },{
        body: t.Object({
        semId: t.Optional(t.Number()),
        name: t.Optional(t.String()),
        course_list: t.Optional(t.Array(t.Number())),
        userid: t.Optional(t.String())
        })
    })

    .get("/api/deleteSemester", async ({ query: {semId} }) => {
        const deleteSem = await prisma.saved_sem.delete({
            where: {
                sem_id: semId
            },
          });
          return deleteSem;
    }, {
        query: t.Object({
        semId: t.Optional(t.Number()),
    })})
    
    .get("api/get_saved_sem", async ({query: {userid}}) => {
        const semesters = await prisma.saved_sem.findMany({
            where: {
                u_id: userid,
            },
            orderBy: {
                sem_id: 'asc',
            },
        });
        return semesters;
     },{
        query: t.Object({
         userid: t.Optional(t.String())
        })
    })

    //Endpoints for registration statistics

    .get("/api/registration", async ({ query: {userid} }) => {
        let registrations = null;
        let uid_undefined = false;
        if(userid==undefined){
            uid_undefined = true;            
        } 
        if(uid_undefined){
            const registrations = await prisma.SavedSem.findMany();
        }
        else if(!uid_undefined){ //find a specific users semesters

            registrations = await prisma.SavedSem.findMany({
                where: {
                    u_id: userid
                }
             })
        }

        return registrations;
    },{
        query: t.Object({
            userid: t.Optional(t.String())
        })
    })
    
    //get count of semesters where a class appears
    .get("api/course_stats", async ({query: {didin}}) => {
        const results: {
            count: number,
            courseName: string,
        }[] = [];
        for (let i = 1; i < 44; i++){
            const count = await prisma.saved_sem.count({
                where: {
                courses: { has: i,},
                },
            });
            const courseName = await prisma.course.findUnique({
                where: {
                    cid: i,
                    isambig: false,
                },
                select: {
                    shortname: true,
                },
            });
            const inDegree = await prisma.degree.findFirst({
                where: {
                    did: didin,
                    courses: {has: i,},
                },
            });
            if (courseName && inDegree){
                results.push({
                    count,
                    courseName,
                });
            };
        };
        return results;
    }, {
        query: t.Object({
            didin: t.Optional(t.Number())
        })
    })

    .get("/api/degree_count", async ({ query: {didin} }) => {
        let passedDId;
        if (didin !== undefined) {
            passedDId = parseInt(didin);
        }
        else {
            passedDId = -1;
        }
    
        const count = await prisma.user.count({
            where: {
                did : passedDId
            },
        });
        return count;
    },{
        query: t.Object({
            didin: t.Optional(t.String())
        })
    })
  
    //Emma's testing zone

    .get("/api/course_test", async ({ 
        query: {} 
    }) => {

    })
    //carolyn's test zone
    .get("/api/caro_test", async ({ 
        query: {test} 
    }) => {

        console.log("begin")
        const semesters = await prisma.saved_sem.findMany({
            where: {
                u_id: "xNgKY4kLlWdCOimDUdIYgVKH9VWK6sLO",
            },
            select: {
                sem_id: true,
                sname: true,
                courses: true,
            },
            orderBy: {
                sem_id: 'asc',
            },
        });
        return semesters;
    })

    //Authentication endpoints
    .all("/api/auth/*", betterAuthView)
    .get("/api/auth/*", betterAuthView)

    //Swagger API Auto-Documentation
    .use(
        swagger({
            path: "/v1/swagger",
        })
    )

    //Adding custom errors from exception folder.
    .error("AUTHENTICATION_ERROR", AuthenticationError)
    .error("AUTHORIZATION_ERROR", AuthorizationError)
    .error("INVARIANT_ERROR", InvariantError)
    .onError(({ code, error, set }) => {
        switch (code) {
            case "AUTHENTICATION_ERROR":
                set.status = 401;
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", ""),
                };
            case "AUTHORIZATION_ERROR":
                set.status = 403;
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", ""),
                };
            case "INVARIANT_ERROR":
                set.status = 400;
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", ""),
                };
            case "NOT_FOUND":
                set.status = 404;
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", ""),
                };
            case "INTERNAL_SERVER_ERROR":
                set.status = 500;
                return {
                    status: "error",
                    message: "Something went wrong!",
                };
        }
    })

    //Add Javascript Web Token (JWT) plugin
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET
                ? process.env.JWT_SECRET
                : "SECRETSECRETSECRET",
            exp: "7d",
        })
    )

    //Add CORS plugin
    .use(cors())

    //Adding static serving plugin for regular webpages.
    /*
    .use(staticPlugin({ 
        prefix: '/',
        assets: '/var/www/UniPlan/frontend/dist/'
    }))
        */
    .use(
        staticPlugin({
            assets: "/var/www/UniPlan/frontend/dist/",
            prefix: "/",
            indexHTML: false,
            noCache: true,
        })
    )
    .use(
        staticPlugin({
            assets: "/var/www/UniPlan/frontend/dist/assets",
            prefix: "/assets",
            noCache: true,
        })
    )
    .get("*", async (context) => {
        return Bun.file("/var/www/UniPlan/frontend/dist/index.html");
    })

    //Set up server listener + HTTPS attributes
    .listen({
        port: 443,
        //Comment this out and discard git changes if you want to run locally.
        //SSL keychain only exists on the box.
        //Ask benevolent dictator gleepglorp if you REALLY need them.
        tls: {
            key: Bun.file("/var/www/ssl/privkey.pem"),
            cert: Bun.file("/var/www/ssl/fullchain.pem"),
        },
    });

//Ta-da!
console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
