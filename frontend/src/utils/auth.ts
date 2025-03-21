import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://uniplanner.ca",
    fetch: {
        credentials: 'include'
    },
    rememberMe: true,
});

import { Session, User } from "better-auth/types";

export const userInfo: UserInfo = {
    user: null,
    session: null,
    set: (user: User|null, session: Session|null) => {
        userInfo.user = user;
        userInfo.session = session;
    },
    check: () => {
        return userInfo.user !== undefined && 
                userInfo.user !== null && 
                userInfo.session !== undefined && 
                userInfo.session !== null;
    }
}

export interface UserInfo {
    user: User | null,
    session: Session | null,
    set: (user: User|null, session: Session|null) => void,
    check: () => boolean
}