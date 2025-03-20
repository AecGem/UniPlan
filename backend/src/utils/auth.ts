import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
    requireEmailVerification: false,
    user : {
        modelName: "users",
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
            }
        }
    }
});
