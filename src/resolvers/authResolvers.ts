import { createHash } from "crypto";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { GraphQLError, GraphQLFormattedError } from "graphql/error";
import { nanoid } from "nanoid";
import { IUser } from "../core";
import { isDev } from "../core/utils";
import { UserAugment } from "./utils";

export async function signinResolver(params: any, req: Request) {
    let body = params as { email: string, password: string };
    let errs: any = {};
    if (!body.email) {
        errs.email = "Indiquez votre email";
    }
    if (!body.password) {
        errs.password = "Indiquez votre mot de passe";
    }

    let db = req.db;
    if (db && Object.keys(errs).length === 0) {
        let matches = await db.partitionedFind("user", {
            selector: {
                email: body.email,
                password: createHash("sha256").update(body.password).digest("hex")
            }
        })

        if (matches.docs.length > 0) {
            let profile = (matches.docs[0] as unknown) as IUser;
            let session = {
                owner: profile._id,
                type: "user",
                created: Date.now()
            }
            let jwt = sign(session, process.env.JWT_SECRET || "", {
                expiresIn: '6h',
                issuer: 'http://localhost:3000/api/auth/signin',
                audience: 'http://localhost:3000'
            })

            return { profile: UserAugment(profile), token: jwt };
        }
        else {
            errs.email = " email";
            errs.password = "Incorrect password";
        }
    }

    let errors: GraphQLFormattedError = {
        message: "Erreur d'authentification",
        extensions: errs
    }

    throw new GraphQLError("Erreur d'authentification", errs);
}


export async function signupResolver(args: any, req: Request) {
    let body = args as { email: string, password: string, firstName: string, lastName: string };
    let errs: any = {};
    if (!body.email) {
        errs.email = "Indiquez votre email";
    }
    if (!body.password) {
        errs.password = "Indiquez votre mot de passe";
    }

    if (body.password) {
        if (body.password.length < 8) {
            errs.password = "Votre mot de passe doit contenir au minimum 8 caractères";
        }
    }

    if (!body.firstName) {
        errs.firstName = "Indiquez votre prénom";
    }

    if (!body.lastName) {
        errs.firstName = "Indiquez votre nom";
    }

    let db = req.db;
    if (db) {
        if (body.email) {
            let exists = await db.partitionedFind("user", {
                selector: {
                    email: body.email
                }
            })

            if (exists.docs.length > 0) {
                errs.email = "Cette adresse mail existe déjà.";
            }
        }

        if (Object.keys(errs).length === 0) {
            let profile: IUser = {
                _id: "user:" + nanoid(),
                firstName: body.firstName.trim(),
                lastName: body.lastName.trim(),
                email: body.email.trim(),
                password: createHash("sha256").update(body.password.trim()).digest("hex"),
                verified: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            let done = await db.insert(profile);
            if (done.id) {
                let session = {
                    owner: profile._id,
                    type: "user",
                    created: Date.now()
                }

                let jwt = sign(session, process.env.JWT_SECRET || "", {
                    expiresIn: '6h',
                    issuer: isDev() ? 'http://localhost:3000' : "https://api.traffichub.co",
                    audience: isDev() ? 'http://localhost:3000' : "https://*.traffichub.co"
                })

                return { profile: UserAugment(profile), token: jwt };
            }
        }
    }

    throw new GraphQLError("Erreur d'inscription", errs);
}