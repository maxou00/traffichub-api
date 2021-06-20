import express from "express-serve-static-core";
import { DocumentScope } from "nano";
import { IUser } from "./core";

declare module "express-serve-static-core" {
    export interface Request {
        db: DocumentScope<unknown>;
        authedProfile: IUser;
        authToken?: string;
    }
}