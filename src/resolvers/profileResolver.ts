import { Request } from "express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { UserAugment } from "./utils";

export async function myProfileResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile

    if (profile) {
        return UserAugment(profile);
    }

    let errors: GraphQLFormattedError = {
        message: "Erreur d'authentification",
    }
    throw errors;
}

export async function singleProfileResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;

    if (db && req.authedProfile && req.authedProfile._id === id) {
        return db.partitionedFind("user", { selector: { _id: id } })
            .then((users) => {
                return UserAugment(users.docs[0]);
            })
    }

    throw new GraphQLError("Utilisateur inconnu")
}

export async function allProfileResolver(args: any, req: Request) {
    let db = req.db;
    if (true || db && req.authedProfile) {
        return db.partitionedFind("user", { selector: {} })
            .then((users) => {
                return users.docs.map(UserAugment);
            })
    }
    throw new GraphQLError("Aucun utilisateur")
}