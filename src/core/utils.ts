export function reporterUrl() {
    return process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "https://www.traffichub.co/api";
}

export function isDev() {
    return process.env.NODE_ENV === "development";
}

export function isStaging() {
    return process.env.NODE_ENV === "production" && process.env.APP_ENV === "staging";
}

export const DATABASE = "traffikhunt";

export function generateObfuscatedReporter(reporter: string) {
    return `
        const _0x2526=['1426027ePYIGA','hardwareConcurrency','12346cRkiBM','maxTouchPoints','connection','750415GgeCmR','pathname','897178gkgwVv','580674MvNVWA','origin','5GVKDgK','userAgent','2jIlWIJ','Sent\x20Report\x20to\x20TrafficHub','vendor','6xCDOsw','type','protocol','log','language','title','POST','webdriver','146862lhuMYn','then','379198rLWEfs','pixelDepth','colorDepth','1BdGPBe','stringify','availHeight','1qAQAkj'];function _0x5c71(_0x3f9397,_0x366df9){_0x3f9397=_0x3f9397-0x93;let _0x252659=_0x2526[_0x3f9397];return _0x252659;}(function(_0x3841ee,_0x171ebf){const _0x3eec14=_0x5c71;while(!![]){try{const _0xab9426=parseInt(_0x3eec14(0xa8))*-parseInt(_0x3eec14(0x9d))+-parseInt(_0x3eec14(0xa9))+parseInt(_0x3eec14(0xb0))*-parseInt(_0x3eec14(0xa3))+-parseInt(_0x3eec14(0x98))*parseInt(_0x3eec14(0xab))+parseInt(_0x3eec14(0x9a))*parseInt(_0x3eec14(0xad))+parseInt(_0x3eec14(0xa6))+-parseInt(_0x3eec14(0xa0))*-parseInt(_0x3eec14(0xa1));if(_0xab9426===_0x171ebf)break;else _0x3841ee['push'](_0x3841ee['shift']());}catch(_0x40a091){_0x3841ee['push'](_0x3841ee['shift']());}}}(_0x2526,0x9e598),(async(_0x20324e,_0x52d81f)=>{const _0x125b19=_0x5c71,_0x3b24f9=()=>{const _0x19bdca=_0x5c71;let _0x1877d8={},_0x3e736a=navigator;return _0x3e736a['connection']&&(_0x1877d8[_0x19bdca(0xa5)]={'effectiveType':_0x3e736a[_0x19bdca(0xa5)]['effectiveType'],'type':_0x3e736a[_0x19bdca(0xa5)][_0x19bdca(0xb1)]}),{'pageTitle':document[_0x19bdca(0x95)],'location':{'href':location['href'],'origin':location[_0x19bdca(0xaa)],'host':location['hostname'],'pathname':location[_0x19bdca(0xa7)],'port':location['port'],'protocol':location[_0x19bdca(0xb2)]},'screen':{'availWidth':screen['availWidth'],'availHeight':screen[_0x19bdca(0x9f)],'width':screen['width'],'height':screen['height'],'colorDepth':screen[_0x19bdca(0x9c)],'pixelDepth':screen[_0x19bdca(0x9b)]},'navigator':{'version':navigator['appVersion'],'vendor':navigator[_0x19bdca(0xaf)],'language':navigator[_0x19bdca(0x94)],'webdriver':navigator[_0x19bdca(0x97)],'userAgent':navigator[_0x19bdca(0xac)],'maxTouchPoints':navigator[_0x19bdca(0xa4)],'concurrency':navigator[_0x19bdca(0xa2)],'extras':_0x1877d8}};};return fetch(_0x20324e+'/report?tag='+_0x52d81f,{'method':_0x125b19(0x96),'body':JSON[_0x125b19(0x9e)](_0x3b24f9()),'headers':{'Content-Type':'application/json;charset=utf-8'}})[_0x125b19(0x99)](_0x2f5041=>{const _0x3a807d=_0x125b19;console[_0x3a807d(0x93)](_0x3a807d(0xae));});})("${reporterUrl()}", "${reporter}"));
    `;
}