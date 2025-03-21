import { authClient } from "../utils/auth";

export const AuthAPI = {
    login: async(email, password, rememberMe = true) => {
        const resp = await authClient.signIn.email({ email, password, rememberMe });
        //console.log(resp);
        return resp;
    },
    signup: async(email, password, fname, lname, usertype) => {
        let name = "";
        name = dummyString.concat(fname, ' ', lname); 
        const resp = await authClient.signUp.email({ email, password, name, usertype });
        //console.log(resp);
        return resp;
    },
    logOut: async () => {
        const resp = await authClient.signOut();
        //console.log(resp);
        return resp;
    },
    me: async () => {
        const resp = await authClient.us
        //console.log(resp);
        return resp;
    }
};