import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: new Pool({
        connectionString:"postgresql://uniplanner:$&asV>2d$oxR<fzp@34.47.10.230:5432/Uniplanner"
    }),
    emailAndPassword: {
        enabled: true
    },
    requireEmailVerification: false,
    trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
    user : {
        additionalFields:{
            usertype: {
                type: "boolean",
                required: true,
                defaultValue: false,
                input: true
            },
            hassaved:{
                type: "boolean",
                required: false,
                defaultValue: false,
                input: true
            },
            did:{
                type: "number",
                required: false,
                defaultValue: null,
                input: true
            }
        }
    }
});
