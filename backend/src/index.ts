import { Elysia } from "elysia";                                            //Base server library
import { swagger } from "@elysiajs/swagger";                                //Swagger documentation
import { jwt } from "@elysiajs/jwt";                                        //Javascript web tokens
import { cors } from "@elysiajs/cors";                                      //Cross origin resource sharing
import { cron } from '@elysiajs/cron';                                      //Cronjobs
import { AuthenticationError } from "./exceptions/AuthenticationError";     //Custom exceptions
import { AuthorizationError } from "./exceptions/AuthorizationError";       // ''
import { InvariantError } from "./exceptions/InvariantError";               // '' 
import { staticPlugin } from '@elysiajs/static';                            //Support for static serving
import { file } from 'bun'                                                  //File I/O?
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = new Elysia()

    .get("/api/courses", async () => {
        const courses = await prisma.course.findMany();
        return courses;
    })
    //Adding swagger auto-documentation endpoint
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
                set.status = 401
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case "AUTHORIZATION_ERROR":
                set.status = 403
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case "INVARIANT_ERROR":
                set.status = 400
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case "NOT_FOUND":
                set.status = 404
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case "INTERNAL_SERVER_ERROR":
                set.status = 500
                return {
                    status: "error",
                    message: "Something went wrong!"
                }
        }
    })

    //Add Javascript Web Token (JWT) plugin
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : "SECRETSECRETSECRET",
        exp: '7d'
    }))

    //Add CORS plugin
    .use(cors())


   
    //Adding static serving plugin.
    .use(staticPlugin({ 
        prefix: '/',
        assets: '/var/www/UniPlan/frontend/dist/pages'
    }))
    
    /*
    //Defining available pages
    .get("/", Bun.file("../frontend/dist/pages/index.html"))
    .get("/registrar", Bun.file("../frontend/dist/pages/Registrar.html"))
    .get("/registrant", Bun.file("../frontend/dist/pages/Registrant.html"))
    */

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