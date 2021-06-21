import { Request } from "express"
import { oneTrackerVisitorsInFrame } from "./projectResolver";

export function UserAugment(user: any) {
    return {
        ...user,
        id: function () { return this._id },
        fullName: function () { return `${this.firstName} ${this.lastName}` },
        projects: async function (args: any, req: Request) {
            return (await req.db.partitionedFind("project", {
                selector: {
                    user: this._id
                }
            })).docs.map((p) => ProjectAugment(p))
        },
        created: function () {
            return new Date(this.createdAt).toUTCString()
        },
        updated: function () {
            return new Date(this.updatedAt).toUTCString()
        },
    }
}

export function ProjectAugment(p: any) {
    return {
        ...p,
        id: function () { return this._id },
        owner: async function (args: any, req: Request) {
            return UserAugment((await req.db.partitionedFind("user", {
                selector: {
                    _id: this.user
                }
            })).docs[0]);
        },
        trackers: async function (args: any, req: Request) {
            return (await req.db.partitionedFind("tracker", {
                selector: {
                    project: this._id
                }
            })).docs.map((t) => TrackerAugment(t))
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
        project: async function (args: any, req: Request) {
            return ProjectAugment((await req.db.partitionedFind("project", {
                selector: {
                    project: this.project
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
        created: function () {
            return new Date(this.createdAt).toUTCString()
        },
        updated: function () {
            return new Date(this.updatedAt).toUTCString()
        },
    }
}