import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://uniplanner.ca",
    fetch: {
        credentials: 'include'
    },
    rememberMe: true,
});
