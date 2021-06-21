export type Timestamp = number;

export interface TimePeriod {
    from: number;
    to: number;
}

export interface TimeGroup<T> extends TimePeriod{
    data: Array<T>;
}

export type RangeChecker<T> = (unit: T, from: Timestamp, to: Timestamp) => boolean;
export type LowerToMaxSorter<T> = (first: T,second: T) => number;


export function medianDate(period: TimePeriod){
   return new Date(Math.floor((period.from + period.to) / 2));
}