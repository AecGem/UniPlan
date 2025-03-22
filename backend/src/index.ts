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

    .get("/api/degree", async () => {
        const degrees = await prisma.degree.findMany();
        return degrees;
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
            let passedId;
            if (userid !== undefined) {
                passedId = parseInt(userid);
            }
            else {
                passedId = -1;
            }
            registrations = await prisma.SavedSem.findMany({
                where: {
                    cid: passedId
                }
             })
        }

        return registrations;
    })
    .get("/api/sems_with_class", async ({ query: {id} }) => {
        let passedCId;
            if (id !== undefined) {
                passedCId = parseInt(id);
            }
            else {
                passedCId = -1;
            }
        
        const count = await prisma.savedSem.count({
            where: {
                courses: {
                    has: passedCId, 
                },
            },
        });
        return count;
    })
    //Emma's testing zone
    .get("/api/course_test", async () => {
        let id = 1
        const count = await prisma.savedSem.count({
            where: {
                courses: {
                    has: id,
                },
            },
        });
        return count;
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
