import { Request } from "express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { nanoid } from "nanoid";
import platform from "platform";
import { IProject, IWebReport, IWebTracker } from "../core";
import { randomColour } from "../core/colours";
import { ReportTimeClassifier } from "../visualization/classifiers";
import { ProjectAugment, ReportAugment, TrackerAugment } from "./utils";

export async function singleProjectResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile

    if (profile) {
        return ProjectAugment((await db.partitionedFind("project", {
            selector: {
                _id: id,
                user: profile._id
            }
        })).docs[0])
    }

    let errors: GraphQLFormattedError = {
        message: "Erreur d'authentification",
    }
    throw errors;
}

export async function createProject(args: any, req: Request) {
    let project = args.project as any;
    let tracker = args.firstTracker as any;

    let db = req.db;
    let profile = req.authedProfile

    if (profile) {
        let errs: any = {};

        let constructed: IProject = {
            _id: "project:" + nanoid(),
            title: (project.title as string).toUpperCase(),
            comment: project.comment,
            user: profile._id,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        if (!constructed.title) {
            errs.title = "Indiquez le titre du projet";
        }
        else {
            let existent = (await db.partitionedFind("project", {
                selector: {
                    title: constructed.title,
                    user: constructed.user
                }
            })).docs;

            if (existent.length > 0) {
                errs.title = "Un projet de ce nom existe déjà";
            }
        }

        if (tracker) {
            if (!tracker.title) {
                errs.trackerTitle = "Indiquez un titre au traqueur";
            }

            if (!tracker.url) {
                errs.trackerUrl = "Indiquez l'adresse internet du site à surveiller."
            }

            let url = tracker.url as string;
            if (url && !url.match(/^(http[s]?):\/\/(.*)?/)) {
                errs.trackerUrl = "Adresse internet invalide";
            }
        }

        if (Object.keys(errs).length > 0) {
            throw new GraphQLError("Corrigez les propriétés incorrectes.", undefined, undefined, undefined, undefined, undefined, errs);
        }

        let projectId = (await db.insert(constructed)).id;
        if (projectId) {
            let trackerDoc: IWebTracker = {
                _id: "tracker:" + nanoid(),
                type: "web",
                project: projectId,
                title: tracker.title,
                url: tracker.url,
                tag: nanoid(),
                createdAt: Date.now(),
                updatedAt: Date.now()
            }

            await db.insert(trackerDoc);
            return { id: projectId };
        }
    }

    let errors: GraphQLFormattedError = {
        message: "Erreur d'authentification",
    }
    throw errors;
}

export async function allProjectsResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile;

    if (profile) {
        return (await db.partitionedFind("project", {
            selector: {
                user: profile._id
            }
        })).docs.map(ProjectAugment)
    }

    throw new GraphQLError("Utilisateur inconnu")
}

export async function singleTrackerResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile;

    if (profile) {
        let tracker = (await db.partitionedFind("tracker", {
            selector: {
                _id: id
            }
        })).docs[0] as unknown as IWebTracker;

        if (tracker) {
            let project = (await db.partitionedFind("project", {
                selector: {
                    _id: tracker.project,
                    user: profile._id
                }
            })).docs[0] as unknown as IProject;

            if (project) {
                return TrackerAugment(tracker);
            }
        }
    }

    throw new GraphQLError("Accès non autorisé")
}

export async function allTrackerResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile;

    if (profile) {
        let projects = (await db.partitionedFind("project", {
            selector: {
                user: profile._id
            }
        })).docs as unknown as IProject[];

        let trackers = (await db.partitionedFind("tracker", {
            selector: {
                project: {
                    "$in": projects.map((p) => p._id)
                }
            }
        })).docs as unknown as IWebTracker[];
        return trackers.map(TrackerAugment);
    }

    throw new GraphQLError("Accès non autorisé")
}

export async function oneTrackerVisitorsInFrame(args: any, req: Request) {
    let tag = args.tag as string;
    let db = req.db;
    let profile = req.authedProfile;

    if (true || profile) {
        let tracker = (await db.partitionedFind("tracker", {
            selector: {
                tag
            },
        })).docs[0] as unknown as IWebTracker;

        if (tracker) {
            let from = args.from ? Date.parse(args.from) : tracker.createdAt;
            let to = args.to ? Date.parse(args.to) : Date.now();
            let period = args.timeframe as number;

            let found: IWebReport[] = [];
            let skip = 0;
            let hasNext = true;

            let selector = {
                trackingTag: tracker.tag,
                "$and": [
                    {
                        createdAt: {
                            "$gte": from
                        }
                    },
                    {
                        createdAt: {
                            "$lte": to
                        }
                    }
                ]
            }

            do {

                await db.partitionedFind("report", {
                    selector,
                    skip
                }).then((rs) => {
                    let reports = rs.docs as unknown[] as IWebReport[];
                    if (reports.length > 0) {
                        let map = reports.map(ReportAugment);
                        found.push(...map);
                        skip += 25;
                    }
                    else {
                        hasNext = false;
                    }
                })

            } while (hasNext);


            if (found) {
                let map = found.map(ReportAugment);
                let browserGroup: any = {};
                let osGroup: any = {};

                if (map.length > 0) {

                    map.forEach((r) => {
                        let name = r.platform().name;
                        let os = r.platform().os?.family || "unknown";

                        if (browserGroup[name]) {
                            browserGroup[name] += 1;
                        }
                        else {
                            browserGroup[name] = 1;
                        }

                        if (osGroup[os]) {
                            osGroup[os] += 1;
                        }
                        else {
                            osGroup[os] = 1;
                        }
                    })
                }

                let classifier = new ReportTimeClassifier(map, {
                    from: from,
                    to: to
                }, period);

                let browserGroupArray = Object.keys(browserGroup).map((g) => `${g}::${browserGroup[g]}::${randomColour()}`);
                let osGroupArray = Object.keys(osGroup).map((g) => `${g}::${osGroup[g]}::${randomColour()}`);

                return { total: map.length, browser: browserGroupArray, os: osGroupArray, reports: map, groups: classifier.groups.map((g) => { return { from: g.from, to: g.to, count: g.data.length } }) };
            }
        }
    }
    return { total: 0, browser: [], os: [], reports: [], groups: [] };
}
