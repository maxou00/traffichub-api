import { allProfileResolver, myProfileResolver, singleProfileResolver } from "./profileResolver";
import { allTrackerResolver, singleTrackerResolver } from "./trackerResolver";

export default {
    me: myProfileResolver,
    profile: singleProfileResolver,
    profiles: allProfileResolver,
    tracker: singleTrackerResolver,
    trackers: allTrackerResolver,
}