import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "https://uniplanner.ca"
})


await authClient.signIn.email({
    email: "test@user.com",
    password: "password1234"
})

/*
await authClient.signUp.email({
    email: "test@user.com",
    password: "password1234"
})*/