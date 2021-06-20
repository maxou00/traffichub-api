import { signinResolver, signupResolver } from "./authResolvers";
import { createProject } from "./projectResolver";

export default {
    signin: signinResolver,
    signup: signupResolver,
    createProject
}