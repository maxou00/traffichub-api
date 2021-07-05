import { Request } from "express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { nanoid } from "nanoid";
import { IWebReport, IWebTracker } from "../core";
import { randomColour } from "../core/colours";
import { ErrorCodes, stackError } from "../core/error-util";
import { ReportTimeClassifier } from "../visualization/classifiers";
import { PERIOD_H1 } from "../visualization/timeframes";
import { ReportAugment, TrackerAugment } from "./utils";

export async function createTracker(args: any, req: Request) {
    let tracker = args.tracker as any;

    let db = req.db;
    let profile = req.authedProfile

    if (profile) {
        let errs: any = {};

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

        if (Object.keys(errs).length > 0) {
            throw stackError(ErrorCodes.BAD_REQUEST, errs);
        }

        let trackerDoc: IWebTracker = {
            _id: "tracker:" + nanoid(),
            type: "web",
            userId: profile._id,
            title: tracker.title,
            url: tracker.url,
            tag: nanoid(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        let r = await db.insert(trackerDoc);
        return { id: r.id };
    }

    throw stackError(ErrorCodes.AUTH_FAILURE, {});
}


export async function singleTrackerResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile;

    if (profile) {
        let tracker = (await db.partitionedFind("tracker", {
            selector: {
                _id: id,
                userId: profile._id
            }
        })).docs[0] as unknown as IWebTracker;

        if (tracker) {
            return TrackerAugment(tracker);
        }
    }

    throw stackError(ErrorCodes.AUTH_FAILURE, {});
}

export async function allTrackerResolver(args: any, req: Request) {
    let id = args.id
    let db = req.db;
    let profile = req.authedProfile;

    if (profile) {
        let trackers = (await db.partitionedFind("tracker", {
            selector: {
                userId: profile._id
            }
        })).docs as unknown as IWebTracker[];
        return trackers.map(TrackerAugment);
    }

    throw stackError(ErrorCodes.AUTH_FAILURE, {});
}

export async function oneTrackerVisitorsInFrame(args: any, req: Request) {
    let tag = args.tag as string;
    let db = req.db;
    let profile = req.authedProfile;

    if (true || profile) {
        let tracker = (await db.partitionedFind("tracker", {
            selector: {
                tag,
                userId: profile._id
            },
        })).docs[0] as unknown as IWebTracker;

        if (tracker) {
            let from = args.from ? Date.parse(args.from) : tracker.createdAt;
            let to = args.to ? Date.parse(args.to) : Date.now();
            let period = args.timeframe as number || PERIOD_H1;

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
