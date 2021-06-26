import { signinResolver, signupResolver } from "./authResolvers";
import { createTracker } from "./trackerResolver";

export default {
    signin: signinResolver,
    signup: signupResolver,
    createTracker
}