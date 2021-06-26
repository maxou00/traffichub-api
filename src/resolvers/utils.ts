import { Request } from "express"
import platform from "platform";
import { oneTrackerVisitorsInFrame } from "./trackerResolver";

export function UserAugment(user: any) {
    return {
        ...user,
        id: function () { return this._id },
        fullName: function () { return `${this.firstName} ${this.lastName}` },
        trackers: async function (args: any, req: Request) {
            return (await req.db.partitionedFind("tracker", {
                selector: {
                    userId: this._id
                }
            })).docs.map((p) => TrackerAugment(p))
        },
        created: function () {
            return new Date(this.createdAt).toUTCString()
        },
        updated: function () {
            return new Date(this.updatedAt).toUTCString()
        },
    }
}

export function TrackerAugment(t: any) {
    return {
        ...t,
        id: function () { return this._id },
        user: async function (args: any, req: Request) {
            return UserAugment((await req.db.partitionedFind("user", {
                selector: {
                    _id: req.authedProfile._id
                }
            })).docs[0]);
        },
        reports: async function (args: any, req: Request) {
            return (await req.db.partitionedFind("report", {
                selector: {
                    trackingTag: this.tag
                }
            })).docs.map((r) => ReportAugment(r))
        },
        visitors: async function (args:any, req: Request) {
            return oneTrackerVisitorsInFrame({...args, tag: this.tag}, req)
        },
        created: function () {
            return new Date(this.createdAt).toUTCString()
        },
        updated: function () {
            return new Date(this.updatedAt).toUTCString()
        },
    }
}

export function ReportAugment(r: any) {
    return {
        ...r,
        id: function () { return this._id },
        tracker: async function (args: any, req: Request) {
            return TrackerAugment((await req.db.partitionedFind("tracker", {
                selector: {
                    tag: this.trackingTag
                }
            })).docs[0]);
        },
        platform: function() {
            return platform.parse(this.navigator.userAgent);
        },
        created: function () {
            return new Date(this.createdAt).toUTCString()
        },
        updated: function () {
            return new Date(this.updatedAt).toUTCString()
        },
    }
}