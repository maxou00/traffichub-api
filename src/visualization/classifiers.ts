import { TimePeriod } from ".";
import { IWebReport } from "../core";
import TimeClassifier from "./timeclassifier";
import { PERIOD_D1 } from "./timeframes";

export class ReportTimeClassifier extends TimeClassifier<IWebReport> {

    constructor(
        source: IWebReport[],
        period: TimePeriod,
        timeframe: number = PERIOD_D1,
    ) {
        super(timeframe,period,source, (unit, from, to) => {
            return unit.createdAt >=  from && unit.createdAt <= to;
        });
    }

    extractTimestamp(unit: IWebReport){
        return unit.createdAt;
    }
}