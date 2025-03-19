import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { prismaAdapter} from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
 

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {    
        enabled: true,
        autoSignIn: true,
    }
});