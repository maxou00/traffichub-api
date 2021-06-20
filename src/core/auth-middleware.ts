import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { IUser } from ".";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    let auth = req.header("authorization");
    if (auth) {
        let token = auth.replace(/bearer/i, "").trim();
        try {
            let decoded = verify(token, process.env.JWT_SECRET || "")
            if (decoded) {
                let db = req.db;
                if (db) {
                    let matches = await db.partitionedFind("user", { selector: { _id: (decoded as any).owner } })
                    if (matches.docs.length > 0) {
                        req.authToken = token;
                        req.authedProfile = matches.docs[0] as unknown as IUser;
                        return next();
                    }
                }
            }
        } catch (error) {
            return next();
        }
    }
    return next();
}