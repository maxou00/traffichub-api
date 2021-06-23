import express from "express";
import { graphqlHTTP } from "express-graphql";
import { DocumentScope } from "nano";
import { database } from "./core/database";
import dotenv from "dotenv";
import { authMiddleware } from "./core/auth-middleware";
import queryResolver from "./resolvers/queryResolver";
import mutationResolver from "./resolvers/mutationResolver";
import { ApiSchema } from "./core/schemas";
import reporter from "./report";
import cors from "cors";
import logger from "morgan";

dotenv.config();

let db: DocumentScope<unknown>;

database()
    .then((d) => {
        db = d;
    })

let root = {
    ...queryResolver,
    ...mutationResolver
}

let app = express();

app.use((req, res, next) => {
    req.db = db;
    next();
})

app.use(logger("dev"))

app.use((req, res, next) => cors({
    origin: req.headers['origin'] || "",
    credentials: true,
    methods: ["GET","POST"]
})(req, res, next)
);

app.use("/report", reporter);

app.use(authMiddleware)

app.use((req,res,next) => {
    next();
})

app.use("/", graphqlHTTP({
    schema: ApiSchema,
    rootValue: root,
    graphiql: {
        headerEditorEnabled: true
    }
}));


app.listen(parseInt(process.env.PORT || "4000"));