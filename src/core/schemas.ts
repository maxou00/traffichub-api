import { Request } from "express";
import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql"

const User: GraphQLObjectType = new GraphQLObjectType({
    name: "User",
    fields: () => {
        return {
            id: {
                type: GraphQLID,
                resolve: (parent, args, context) => { return parent._id },
            },
            firstName: { type: GraphQLString },
            lastName: { type: GraphQLString },
            fullName: {
                type: GraphQLString,
                resolve: (parent) => `${parent.firstName} ${parent.lastName}`
            },
            email: { type: GraphQLString },
            createdAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.createdAt).toUTCString()
            },
            updatedAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.updatedAt).toUTCString()
            },
            projects: {
                type: new GraphQLList(Project),
                resolve: async (parent, args, req: Request) => {
                    return (await req.db.partitionedFind("project", {
                        selector: {
                            user: parent._id
                        }
                    })).docs
                }
            }
        }
    }
});

const Project = new GraphQLObjectType({
    name: "Project",
    fields: () => {
        return {
            id: {
                type: GraphQLID,
                resolve: (parent, args, context) => parent._id
            },
            title: { type: GraphQLString },
            comment: { type: GraphQLString },
            createdAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.createdAt).toUTCString()
            },
            updatedAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.updatedAt).toUTCString()
            },
            owner: {
                type: User,
                resolve: async (parent, args, ctx: Request) => {
                    return (await ctx.db.partitionedFind("user", {
                        selector: {
                            _id: parent.user
                        }
                    })).docs[0]
                }
            },
            trackers: {
                type: new GraphQLList(WebTracker),
                resolve: async (parent, args, ctx: Request) => {
                    return (await ctx.db.partitionedFind("tracker", {
                        selector: {
                            project: parent._id
                        }
                    })).docs
                }
            }
        }
    }
});

const WebTracker = new GraphQLObjectType({
    name: "WebTracker",
    fields: () => {
        return {
            id: {
                type: GraphQLID,
                resolve: (parent, args, context) => parent._id
            },
            project: {
                type: GraphQLString,
                resolve: async (parent, args, ctx: Request) => {
                    return (await ctx.db.partitionedFind("project", {
                        selector: {
                            project: parent.project
                        }
                    })).docs[0]
                }
            },
            title: { type: GraphQLString },
            type: { type: GraphQLString },
            url: { type: GraphQLString },
            tag: { type: GraphQLString },
            createdAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.createdAt).toUTCString()
            },
            updatedAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.updatedAt).toUTCString()
            },
            reports: {
                type: new GraphQLList(WebReport),
                resolve: async (parent, args, ctx: Request) => {
                    return (await ctx.db.partitionedFind("report", {
                        selector: {
                            trackingTag: parent.tag
                        }
                    })).docs
                }
            }
        }
    }
});

const IpInfo = new GraphQLObjectType({
    name: "IpInfo",
    fields: () => {
        return {
            ip: { type: GraphQLString },
            hostname: { type: GraphQLString },
            region: { type: GraphQLString },
            country: { type: GraphQLString },
            loc: { type: GraphQLString },
            postal: { type: GraphQLString },
            timezone: { type: GraphQLString },
        }
    }
})

const WebReportLocation = new GraphQLObjectType({
    name: "WebReportLocation",
    fields: () => {
        return {
            href: { type: GraphQLString },
            origin: { type: GraphQLString },
            host: { type: GraphQLString },
            pathname: { type: GraphQLString },
            port: { type: GraphQLString },
            protocol: { type: GraphQLString },
        }
    }
})

const WebReportScreen = new GraphQLObjectType({
    name: "WebReportScreen",
    fields: () => {
        return {
            availWidth: { type: GraphQLFloat },
            availHeight: { type: GraphQLFloat },
            width: { type: GraphQLFloat },
            height: { type: GraphQLFloat },
            colorDepth: { type: GraphQLFloat },
            pixelDepth: { type: GraphQLFloat },
        }
    }
})

const WebReportNavigatorExtras = new GraphQLObjectType({
    name: "WebReportNavigatorExtras",
    fields: () => {
        return {
            effectiveType: { type: GraphQLString },
            type: { type: GraphQLString },
        }
    }
})

const WebReportNavigator = new GraphQLObjectType({
    name: "WebReportNavigator",
    fields: () => {
        return {
            version: { type: GraphQLString },
            vendor: { type: GraphQLString },
            language: { type: GraphQLString },
            webdriver: { type: GraphQLBoolean },
            maxTouchPoints: { type: GraphQLFloat },
            concurrency: { type: GraphQLFloat },
            extras: { type: WebReportNavigatorExtras }
        }
    }
})

const WebReport = new GraphQLObjectType({
    name: "WebReport",
    fields: () => {
        return {
            id: {
                type: GraphQLID,
                resolve: (parent, args, context) => parent._id
            },
            project: {
                type: GraphQLString,
                resolve: async (parent, args, ctx: Request) => {
                    return (await ctx.db.partitionedFind("project", {
                        selector: {
                            project: parent.project
                        }
                    })).docs[0]
                }
            },
            trackingTag: { type: GraphQLString },
            pageTitle: { type: GraphQLString },
            location: { type: WebReportLocation },
            screen: { type: WebReportScreen },
            navigator: { type: WebReportNavigator },
            reporterAdress: { type: GraphQLString },
            ipInfo: { type: IpInfo },
            createdAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.createdAt).toUTCString()
            },
            updatedAt: {
                type: GraphQLString,
                resolve: (parent, args) => new Date(parent.updatedAt).toUTCString()
            },
        }
    }
})

const SigninResponse = new GraphQLObjectType({
    name: "SigninResponse",
    fields: {
        profile: { type: User },
        token: { type: GraphQLString }
    }
});

const ProjectInput = new GraphQLInputObjectType({
    name: "ProjectInput",
    fields: {
        title: { type: GraphQLString },
        comment: { type: GraphQLString }
    }
});

const TrackerInput = new GraphQLInputObjectType({
    name: "TrackerInput",
    fields: {
        title: { type: GraphQLString },
        url: { type: GraphQLString }
    }
});

const ProjectInputResponse = new GraphQLObjectType({
    name: "ProjectInputResponse",
    fields: {
        id: { type: GraphQLString },
    }
});

const Query = new GraphQLObjectType({
    name: "Query",
    fields: {
        me: { type: User },
        profile: {
            type: User,
            args: {
                id: { type: GraphQLString }
            },
        },
        profiles: {
            type: new GraphQLList(User)
        },
        project: {
            type: Project,
            args: {
                id: { type: GraphQLString }
            },
        },
        projects: {
            type: new GraphQLList(Project)
        },
        tracker: {
            type: WebTracker,
            args: {
                id: { type: GraphQLString }
            },
        },
        trackers: {
            type: new GraphQLList(WebTracker)
        },
        reports: {
            type: new GraphQLList(WebReport)
        },
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        signin: {
            type: SigninResponse,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            }
        },
        signup: {
            type: SigninResponse,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                confirmPassword: { type: GraphQLString },
            }
        },
        createProject: {
            type: ProjectInputResponse,
            args: {
                project: { type: ProjectInput },
                firstTracker: { type: TrackerInput }
            }
        }
    }
});

export const ApiSchema = new GraphQLSchema({
    query: Query,
    mutation: Mutation
})