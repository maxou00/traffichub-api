
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