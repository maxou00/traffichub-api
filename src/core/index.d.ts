
export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    password: string;
    verified: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface IWebTracker {
    _id: string;
    title: string;
    userId: string;
    type: 'web';
    url: string;
    tag: string;
    createdAt: number;
    updatedAt: number;
}

export interface IpInfo {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    postal: string;
    timezone: string;
}   

export interface IWebReport {
    _id: string;
    project: string;
    trackingTag: string;
    pageTitle: string;
    location: {
        href: string;
        origin: string;
        host: string;
        pathname: string;
        port: string;
        protocol: string
    },
    screen: {
        availWidth: number;
        availHeight: number;
        width: number;
        height: number;
        colorDepth: number;
        pixelDepth: number;
    },
    navigator: {
        version: string;
        vendor: string;
        language: string;
        webdriver: boolean;
        maxTouchPoints: number
        concurrency: number;
        extras: {
            effectiveType?: string; // 2g 3g 4g ...
            type?: string; // wifi bluetooth wimax, ethernet ...
        }
    },
    reporterAdress: string;
    ipInfo?: IpInfo;
    createdAt: number;
    updatedAt: number;
}