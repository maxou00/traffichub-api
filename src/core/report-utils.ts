import { regexes } from "./regexes";

export const buildReportingScript = (url: string, tag: string) => `
    const __tfh_collectAnalytics = () => {
        let navigatorExtras = {};
        let anyfied = navigator;
        if(anyfied.connection) {
            navigatorExtras.connection = {
                effectiveType: anyfied.connection.effectiveType, // 2g 3g 4g
                type: anyfied.connection.type /// wifi bluetooth ethernet wimax...
            }
        }
    
        return {
            pageTitle: document.title,
            location: {
                href: location.href,
                origin: location.origin,
                host: location.hostname,
                pathname: location.pathname,
                port: location.port,
                protocol: location.protocol
            },
            screen: {
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            navigator: {
                version: navigator.appVersion,
                vendor: navigator.vendor,
                language: navigator.language,
                webdriver: navigator.webdriver,
                userAgent: navigator.userAgent,
                maxTouchPoints: navigator.maxTouchPoints,
                concurrency: navigator.hardwareConcurrency,
                extras: navigatorExtras
            }
        }
    }

    const __tfh_sendReport = async () => fetch(
        "${url}/report/${tag}",
        {
            method: "POST",
            body: JSON.stringify(__tfh_collectAnalytics()),
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        }
    )
    .then((done) => {
        console.log("Sent Report to TrafficHub");
    })

    __tfh_sendReport();
`;

let samples = [
    "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 OPR/77.0.4054.64",
    "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
]