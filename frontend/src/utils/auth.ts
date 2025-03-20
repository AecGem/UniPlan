import { Session, User } from "better-auth/types";
import { AuthAPI } from "../apis/AuthAPI"
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    //@ts-ignore
    baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:3000/",
    fetch: {
        credentials: 'include'
    },
    rememberMe: true,
});

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

export const logOut = async (e) => {
    e.preventDefault();
    await authClient.signOut();
    userInfo.set(null, null);
}