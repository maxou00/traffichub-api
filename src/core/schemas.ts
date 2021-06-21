import { buildSchema } from "graphql"
import { readFileSync } from  "fs";
import { join } from "path";

export const ApiSchema = buildSchema(
    readFileSync(join(__dirname, "..", "..", "schema.gql")).toString("utf-8"),
)