import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { AuthenticationError } from "./exceptions/AuthenticationError";
import { AuthorizationError } from "./exceptions/AuthorizationError";
import { InvariantError } from "./exceptions/InvariantError";
import { staticPlugin } from '@elysiajs/static';
import { file } from 'bun'

const app = new Elysia()
    .use(
        swagger({
            path: "/v1/swagger",
        })
    )
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
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : "SECRETSECRETSECRET",
        exp: '7d'
    }))
    .use(cors())
    .use(staticPlugin({ 
        prefix: '/',
        assets: '/var/www/UniPlan/frontend'
    }))
    /*

    Commenting these out for now to test static tooling.

    .get("/", () => "Hello Elysia!")
    .get("/registrar", () => "Hello Elysia! Welcome to the registrar page.")
    .get("/registrant", () => "Hello Elysia! Welcome to the registrant page.")
    .get("/login", () => "Hello Elysia! Welcome to the login page.")
    */
    .listen({
        port: 443,
        //Comment this out and discard git changes if you want to run locally.
        //SSL keychain only exists on the box.
        //Ask benevolent dictator gleepglorp if you REALLY need them.
        tls: {
            key: Bun.file("/var/www/ssl/privkey.pem"),
            cert: Bun.file("/var/www/ssl/fullchain.pem"),
        },
        //hostname: "uniplanner.ca",

    }); 

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);