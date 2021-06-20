import { nanoid } from "nanoid";
import axios from "axios";
import { Request, Response } from "express";
import { IWebReport, IWebTracker } from "./core";

export default async function reporter(req: Request, res: Response) {
    let tag = req.query.tag;
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
                body.project = match.project;
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
    return res.status(200).json("success");
}