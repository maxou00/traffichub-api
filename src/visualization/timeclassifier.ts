import { RangeChecker, TimeGroup, TimePeriod } from ".";

abstract class TimeClassifier<T>{
    public timeframe: number;
    public period: TimePeriod;
    public source: Array<T>;
    public checker: RangeChecker<T>;

    constructor(
        timeframe: number,
        period: TimePeriod,
        source: T[], 
        checker: RangeChecker<T>
    ) {
        this.timeframe = timeframe;
        this.period = period;
        this.source = source;
        this.checker = checker;
    }

    abstract extractTimestamp(item: T): number;

    /**
     * Called to group items in timeframe ranges
     */
    public get groups(){
        /// Step 1: Find lower date and upper date.
        /// step 2: divide time range into groups according to specified timeframe.
        /// Step 3: fill ranges with data.

        let temporalSpace = this.period.to - this.period.from;
        let periodCount = Math.ceil(temporalSpace / this.timeframe);

        let groups: Array<TimeGroup<T>> = [];
        /// Setup ranges

        let periodStart = this.period.from;

        if(periodCount === 0){
            ///No period
            groups.push({
                from: this.period.from,
                to: this.period.to,
                data: this.source
            });
            return groups;
        }

        for(let i = 0; i < periodCount; i++){
            let start = periodStart;
            let end = start + this.timeframe - 1;
            if(end >= this.period.to){
                end = this.period.to;
            }

            let matches = this.source.filter((t,i) => this.checker(t, start, end))

            groups.push({
                from: start,
                to: end,
                data: matches
            });
            
            periodStart = end + 1;
        }

        return groups;
    }
}

export default TimeClassifier;