import { authClient } from "../utils/auth";
import { userInfo } from "../utils/auth";

export const AuthAPI = {
    login: async(email, password, rememberMe = true) => {
        const resp = await authClient.signIn.email({ email, password, rememberMe });
        //console.log(resp);
        return resp;
    },
    signup: async(email, password, name, usertype) => {
        const resp = await authClient.signUp.email({ email, password, name, usertype });
        //console.log(resp);
        return resp;
    },
    logOut: async () => {
        const resp = await authClient.signOut();
        userInfo.set(null, null);
        //console.log(resp);
        return resp;
    },
    me: async () => {
        const resp = await authClient.us
        //console.log(resp);
        return resp;
    }
};