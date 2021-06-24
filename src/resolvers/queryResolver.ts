import { allProfileResolver, myProfileResolver, singleProfileResolver } from "./profileResolver";
import { allProjectsResolver, allTrackerResolver, singleProjectResolver, singleTrackerResolver } from "./projectResolver";

export default {
    me: myProfileResolver,
    profile: singleProfileResolver,
    profiles: allProfileResolver,
    project: singleProjectResolver,
    projects: allProjectsResolver,
    tracker: singleTrackerResolver,
    trackers: allTrackerResolver,
    
}