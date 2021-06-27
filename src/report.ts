import { nanoid } from "nanoid";
import axios from "axios";
import { json, Request, Response, Router } from "express";
import { IWebReport, IWebTracker } from "./core";
import { buildReportingScript } from "./core/report-utils";
import { isDev } from "./core/utils";

const router = Router();

router.get("/:tag", async (req: Request, res: Response) => {
    let tag = req.params.tag.replace(".js", "");

    let script = buildReportingScript(
        isDev() ? `http://localhost:${process.env.PORT || '4000'}` : "https://api.traffichub.co",
        tag
    )

    res.status(200).header("Content-Type", "text/javascript").send(script);
});

router.use(json());

router.post("/:tag", async (req: Request, res: Response) => {
    let tag = req.params.tag;
    if (tag) {
        let db = req.db
        if (db) {
            let matches = await db.partitionedFind("tracker", {
                selector: {
                    tag: tag
                }
            })

            res.status(200).json({ success: true });

            if (matches.docs.length > 0) {
                let match = (matches.docs[0] as unknown) as IWebTracker;
                let body = req.body as IWebReport;
                body._id = "report:" + nanoid();
                body.trackingTag = match.tag;
                body.createdAt = Date.now();
                body.updatedAt = Date.now();

                let ipAddress = req.socket.remoteAddress;
                if (process.env.NODE_ENV === "production") {
                    ipAddress = req.headers['x-real-ip'] as string;
                }
                body.reporterAdress = ipAddress as string;
                if (!ipAddress?.includes("127.0.0.1")) {
                    let ipData = await axios.get(
                        `https://ipinfo.io/${ipAddress}`
                    )
                        .then((info) => info.data)
                    body.ipInfo = ipData;
                }
                await db.insert(body);
            }
        }
    }
});

export default router;
