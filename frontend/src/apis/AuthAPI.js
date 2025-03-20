import { api } from "../utils/Treaty";
import { authClient } from "../utils/auth";

export const AuthAPI = {
    login: async(email, password, rememberMe = true) => {
        const resp = await authClient.signIn.email({ email, password, rememberMe });
        //console.log(resp);
        return resp;
    },
    signup: async(email, password, name) => {
        const resp = await authClient.signUp.email({ email, password, name });
        //console.log(resp);
        return resp;
    },
    logOut: async () => {
        const resp = await authClient.signOut();
        return resp;
    },
    me: async () => {
        const resp = await authClient.us
        return resp;
    }
};