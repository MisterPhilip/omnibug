/**
 * Generic Base Provider
 *
 * @class
 */
/* exported BaseProvider */
class BaseProvider
{
    constructor()
    {
        this._key        = "";
        this._pattern    = /.*/;
        this._name       = "";
        this._type       = "";
    }

    /**
     * Get the Provider's key
     *
     * @returns {string}
     */
    get key()
    {
        return this._key;
    }

    /**
     * Get the Provider's type
     *
     * @returns {string}
     */
    get type()
    {
        let types = {
            "analytics":    "Analytics",
            "testing":      "UX Testing",
            "tagmanager":   "Tag Manager",
            "visitorid":    "Visitor Identification"
        };
        return types[this._type] || "Unknown";
    }

    /**
     * Get the Provider's RegExp pattern
     *
     * @returns {RegExp}
     */
    get pattern()
    {
        return this._pattern;
    }

    /**
     * Get the Provider's name
     *
     * @returns {string}
     */
    get name()
    {
        return this._name;
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {};
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {};
    }

    /**
     * Check if this provider should parse the given URL
     *
     * @param {string}  rawUrl   A URL to check against
     *
     * @returns {Boolean}
     */
    checkUrl(rawUrl)
    {
        return this.pattern.test(rawUrl);
    }

    /**
     * Parse a given URL into human-readable output
     *
     * @param {string}  rawUrl      A URL to check against
     * @param {string}  postData    POST data, if applicable
     *
     * @return {{provider: {name: string, key: string, type: string}, data: Array}}
     */
    parseUrl(rawUrl, postData = "")
    {
        let url = new URL(rawUrl),
            data = [],
            params = new URLSearchParams(url.search),
            postParams = this.parsePostData(postData);

        // Handle POST data first, if applicable (treat as query params)
        postParams.forEach((pair) => {
            params.append(pair[0], pair[1]);
        });

        for(let param of params)
        {
            let key = param[0],
                value = param[1],
                result = this.handleQueryParam(key, value);
            if(typeof result === "object") {
                data.push(result);
            }
        }

        let customData = this.handleCustom(url);
        if(typeof customData === "object" && customData !== null)
        {
            if(customData.length) {
                data = data.concat(customData);
            } else {
                data.push(customData);
            }
        }

        return {
            "provider": {
                "name":    this.name,
                "key":     this.key,
                "type":    this.type,
                "columns": this.columnMapping
            },
            "data": data
        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array}
     */
    parsePostData(postData = "")
    {
        let params = [];
        // Handle POST data first, if applicable (treat as query params)
        if(typeof postData === "string" && postData !== "")
        {
            let keyPairs = postData.split("&");
            keyPairs.forEach((keyPair) => {
                let splitPair = keyPair.split("=");
                params.push([splitPair[0], decodeURIComponent(splitPair[1] || "")]);
            });
        }
        return params;
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     * @returns {{}}
     */
    handleQueryParam(name, value)
    {
        let param = this.keys[name] || {};
        return {
            "key":   name,
            "field": param.name || name,
            "value": value,
            "group": param.group || "Other"
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     *
     * @returns {void|Array}
     */
    handleCustom(url)
    {

    }
}
/**
 * Omnibug Provider Factory
 *
 * @type {{addProvider, getProviders, checkUrl, getProviderForUrl, parseUrl, defaultPattern}}
 */
/* exported OmnibugProvider */
var OmnibugProvider = (function() {

    var providers = {},
        defaultPattern = [],
        defaultPatternRegex = new RegExp();

    /**
     * Return the provider for a specified url
     *
     * @param url
     *
     * @returns {typeof BaseProvider}
     */
    let getProviderForUrl = (url) => {
        for(let provider in providers) {
            if(!providers.hasOwnProperty(provider)) {
                continue;
            }
            if(providers[provider].checkUrl(url)) {
                return providers[provider];
            }
        }
        return new BaseProvider();
    };

    return {

        /**
         * Add a new provider
         *
         * @param {typeof BaseProvider} provider
         */
        "addProvider": (provider) => {
            providers[provider.key] = provider;
            defaultPattern.push(provider.pattern);
            defaultPatternRegex = new RegExp(defaultPattern.map((el) => {
                return el.source;
            }).join("|"));
        },

        /**
         * Returns a list of all added providers
         *
         * @returns {{}}
         */
        "getProviders": () => {
            return providers;
        },

        /**
         * Checks if a URL should be parsed or not
         *
         * @param {string}  url   URL to check against
         *
         * @returns {boolean}
         */
        "checkUrl": (url) => {
            return defaultPatternRegex.test(url);
        },

        /**
         * Return the provider for a specified url
         *
         * @param url
         *
         * @returns {typeof BaseProvider}
         */
        "getProviderForUrl": getProviderForUrl,

        /**
         * Parse a URL into a JSON object
         *
         * @param {string}  url         URL to be parsed
         * @param {string}  postData    POST data, if applicable
         *
         * @returns {{provider, data}}
         */
        "parseUrl": (url, postData = "") => {
            return getProviderForUrl(url).parseUrl(url, postData);
        },

        /**
         * Return the patterns for all (enabled) providers
         *
         * @param   {void|[]}  enabledProviders    Providers that are enabled
         *
         * @returns {RegExp}
         */
        "getPattern": (enabledProviders) => {
            if(!enabledProviders || !enabledProviders.length) {
                return defaultPatternRegex;
            }

            let patterns = [];
            enabledProviders.forEach((provider) => {
                if(providers[provider]) {
                    patterns.push(providers[provider].pattern.source);
                }
            });
            return new RegExp(patterns.join("|"));
        }
    };
})();
/**
 * Adobe Analytics
 * http://www.adobe.com/data-analytics-cloud/analytics.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeAnalyticsProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEANALYTICS";
        this._pattern    = /\/b\/ss\/|\.2o7\.net\/|\.sc\d?\.omtrdc\.net\//;
        this._name       = "Adobe Analytics";
        this._type       = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "rsid",
            "requestType":  "requestType"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "ns": {
                "name": "Visitor namespace",
                "group": "General"
            },
            "ndh": {
                "name": "Image sent from JS?",
                "group": "General"
            },
            "ch": {
                "name": "Channel",
                "group": "General"
            },
            "v0": {
                "name": "Campaign",
                "group": "General"
            },
            "r": {
                "name": "Referrer URL",
                "group": "General"
            },
            "ce": {
                "name": "Character set",
                "group": "General"
            },
            "cl": {
                "name": "Cookie lifetime",
                "group": "General"
            },
            "g": {
                "name": "Current URL",
                "group": "General"
            },
            "j": {
                "name": "JavaScript version",
                "group": "General"
            },
            "bw": {
                "name": "Browser width",
                "group": "General"
            },
            "bh": {
                "name": "Browser height",
                "group": "General"
            },
            "s": {
                "name": "Screen resolution",
                "group": "General"
            },
            "c": {
                "name": "Screen color depth",
                "group": "General"
            },
            "ct": {
                "name": "Connection type",
                "group": "General"
            },
            "p": {
                "name": "Netscape plugins",
                "group": "General"
            },
            "k": {
                "name": "Cookies enabled?",
                "group": "General"
            },
            "hp": {
                "name": "Home page?",
                "group": "General"
            },
            "pid": {
                "name": "Page ID",
                "group": "General"
            },
            "pidt": {
                "name": "Page ID type",
                "group": "General"
            },
            "oid": {
                "name": "Object ID",
                "group": "General"
            },
            "oidt": {
                "name": "Object ID type",
                "group": "General"
            },
            "ot": {
                "name": "Object tag name",
                "group": "General"
            },
            "pe": {
                "name": "Link type",
                "group": "General"
            },
            "pev1": {
                "name": "Link URL",
                "group": "General"
            },
            "pev2": {
                "name": "Link name",
                "group": "General"
            },
            "pev3": {
                "name": "Video milestone",
                "group": "General"
            },
            "cc": {
                "name": "Currency code",
                "group": "General"
            },
            "t": {
                "name": "Browser time",
                "group": "General"
            },
            "v": {
                "name": "Javascript-enabled browser?",
                "group": "General"
            },
            "pccr": {
                "name": "Prevent infinite redirects",
                "group": "General"
            },
            "vid": {
                "name": "Visitor ID",
                "group": "General"
            },
            "vidn": {
                "name": "New visitor ID",
                "group": "General"
            },
            "fid": {
                "name": "Fallback Visitor ID",
                "group": "General"
            },
            "mid": {
                "name": "Marketing Cloud Visitor ID",
                "group": "General"
            },
            "aid": {
                "name": "Legacy Visitor ID",
                "group": "General"
            },
            "cdp": {
                "name": "Cookie domain periods",
                "group": "General"
            },
            "pageName": {
                "name": "Page name",
                "group": "General"
            },
            "pageType": {
                "name": "Page type",
                "group": "General"
            },
            "server": {
                "name": "Server",
                "group": "General"
            },
            "events": {
                "name": "Events",
                "group": "General"
            },
            "products": {
                "name": "Products",
                "group": "General"
            },
            "purchaseID": {
                "name": "Purchase ID",
                "group": "General"
            },
            "state": {
                "name": "Visitor state",
                "group": "General"
            },
            "vmk": {
                "name": "Visitor migration key",
                "group": "General"
            },
            "vvp": {
                "name": "Variable provider",
                "group": "General"
            },
            "xact": {
                "name": "Transaction ID",
                "group": "General"
            },
            "zip": {
                "name": "ZIP/Postal code",
                "group": "General"
            },
            "rsid": {
                "name": "Report Suites",
                "group": "General"
            },
            "requestType": {
                "hidden": true
            }
        };
    }

    /**
     * Parse a given URL into human-readable output
     *
     * @param {string}  rawUrl   A URL to check against
     * @param {string}  postData    POST data, if applicable
     *
     * @return {{provider: {name: string, key: string, type: string}, data: Array}}
     */
    parseUrl(rawUrl, postData = "")
    {
        let url = new URL(rawUrl),
            data = [],
            stacked = [],
            params = new URLSearchParams(url.search),
            postParams = this.parsePostData(postData);

        // Handle POST data first, if applicable (treat as query params)
        postParams.forEach((pair) => {
            params.append(pair[0], pair[1]);
        });

        for(let param of params)
        {
            let key = param[0],
                value = param[1];

            // Stack context data params
            if (/\.$/.test(key)) {
                stacked.push(key);
                continue;
            }
            if (/^\./.test(key)) {
                stacked.pop();
                continue;
            }

            let stackedParam = stacked.join("") + key,
                result = this.handleQueryParam(stackedParam, value);
            if(typeof result === "object") {
                data.push(result);
            }
        }

        let customData = this.handleCustom(url);
        if(typeof customData === "object" && customData !== null)
        {
            if(customData.length) {
                data = data.concat(customData);
            } else {
                data.push(customData);
            }
        }

        return {
            "provider": {
                "name": this.name,
                "key":  this.key,
                "type": this.type,
                "columns": this.columnMapping
            },
            "data": data
        };
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     *
     * @returns {void|{}}
     */
    handleQueryParam(name, value)
    {
        let result = {};
        if(/^(?:c|prop)(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "prop" + RegExp.$1,
                "value": value,
                "group": "Custom Traffic Variables (props)"
            };
        } else if(/^(?:v|eVar)(\d+)$/i.test(name) && name !== "v0") {
            result = {
                "key":   name,
                "field": "eVar" + RegExp.$1,
                "value": value,
                "group": "Custom Conversion Variables (eVars)"
            };
        } else if(/^(?:h|hier)(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Hierarchy " + RegExp.$1,
                "value": value,
                "group": "Hierarchy Variables"
            };
        } else if(name.indexOf(".a.media.") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "Media Module"
            };
        } else if(name.indexOf(".a.activitymap.") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "Activity Map"
            };
        } else if(name.indexOf(".") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "Context Data"
            };
        } else if(/^(AQB|AQE)$/i.test(name)) {
            // ignore
            return;
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {string} url
     *
     * @returns {Array}
     */
    handleCustom(url)
    {
        let results = [],
            rsid = url.pathname.match(/\/b\/ss\/([^\/]+)\//),
            pev2 = url.searchParams.get("pe"),
            requestType = "Page View";
        if(rsid) {
            results.push({
                "key":   "rsid",
                "field": this.keys.rsid ? this.keys.rsid.name : "Report Suites",
                "value": rsid[1],
                "group": this.keys.rsid ? this.keys.rsid.group : "General",
            });
        }

        // Handle s.tl calls
        if(pev2 === "lnk_e") {
            requestType = "Exit Click";
        } else if(pev2 === "lnk_d") {
            requestType = "Download Click";
        } else if(pev2 === "lnk_o") {
            requestType = "Other Click";
        }
        results.push({
            "key":   "requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}
/**
 * Adobe Audience Manager
 * http://www.adobe.com/data-analytics-cloud/audience-manager.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeAudienceManagerProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEAUDIENCEMANAGER";
        this._pattern    = /demdex\.net\//;
        this._name       = "Adobe Audience Manager";
        this._type       = "visitorid";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account": "d_orgid"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "d_orgid": {
                "name": "Adobe Organization ID",
                "group": "General"
            },
            "d_rtbd": {
                "name": "Return Method",
                "group": "General"
            },
            "d_cb": {
                "name": "Callback property",
                "group": "General"
            }
        };
    }
}
/**
 * Adobe Target
 * http://www.adobe.com/marketing-cloud/target.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeTargetProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBETARGET";
        this._pattern    = /\.tt\.omtrdc\.net\//;
        this._name       = "Adobe Target";
        this._type       = "testing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "mbox",
            "requestType":  "mboxType"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "mbox": {
                "name": "Mbox Name",
                "group": "General"
            },
            "mboxType": {
                "name": "Mbox Type",
                "group": "General"
            },
            "mboxCount": {
                "name": "Mbox Count",
                "group": "General"
            },
            "mboxId": {
                "name": "Mbox ID",
                "group": "General"
            },
            "mboxSession": {
                "name": "Mbox Session",
                "group": "General"
            },
            "mboxPC": {
                "name": "Mbox PC ID",
                "group": "General"
            },
            "mboxPage": {
                "name": "Mbox Page ID",
                "group": "General"
            },
            "clientCode": {
                "name": "Client Code",
                "group": "General"
            },
            "mboxHost": {
                "name": "Page Host",
                "group": "General"
            },
            "mboxURL": {
                "name": "Page URL",
                "group": "General"
            },
            "mboxReferrer": {
                "name": "Page Referrer",
                "group": "General"
            },
            "screenHeight": {
                "name": "Screen Height",
                "group": "General"
            },
            "screenWidth": {
                "name": "Screen Width",
                "group": "General"
            },
            "browserWidth": {
                "name": "Browser Width",
                "group": "General"
            },
            "browserHeight": {
                "name": "Browser Height",
                "group": "General"
            },
            "browserTimeOffset": {
                "name": "Browser Timezone Offset",
                "group": "General"
            },
            "colorDepth": {
                "name": "Browser Color Depth",
                "group": "General"
            },
            "mboxXDomain": {
                "name": "CrossDomain Enabled",
                "group": "General"
            },
            "mboxTime": {
                "name": "Timestamp",
                "group": "General"
            },
            "mboxVersion": {
                "name": "Library Version",
                "group": "General"
            }
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {URL} url
     *
     * @returns {void|Array}
     */
    handleCustom(url)
    {
        let matches =  url.pathname.match( /\/([^\/]+)\/mbox\/([^\/?]+)/ ),
            mboxName = "",
            results = [];
        if(matches !== null && matches.length === 3) {
            results.push({
                "key":   "clientCode",
                "field": "Client Code",
                "value": matches[1],
                "group": "General"
            });
            results.push({
                "key":   "mboxType",
                "field": "Mbox Type",
                "value": matches[2],
                "group": "General"
            });
        }

        return results;
    }
}
/**
 * Optimizely
 * https://www.optimizely.com/
 *
 * @class
 * @extends BaseProvider
 */
class OptimizelyXProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "OPTIMIZELYX";
        this._pattern    = /\.optimizely\.com\/log\/event/;
        this._name       = "Optimizely X";
        this._type       = "testing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "mbox"
        }
    }


    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {

        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array}
     */
    parsePostData(postData = "")
    {
        let params = [],
            parsed = {};
        if(typeof postData === "string" && postData !== "")
        {
            try
            {
                parsed = JSON.parse(postData);

                /* Based on https://stackoverflow.com/a/19101235 */
                function recurse (cur, prop)
                {
                    if (Object(cur) !== cur)
                    {
                        params.push([prop, cur]);
                    }
                    else if (Array.isArray(cur))
                    {
                        for(var i=0, l=cur.length; i<l; i++)
                        {
                            recurse(cur[i], prop + "[" + i + "]");
                        }
                        if (l === 0)
                        {
                            params.push([prop, ""]);
                        }
                    }
                    else
                    {
                        let isEmpty = true;
                        for (let p in cur)
                        {
                            if(!cur.hasOwnProperty(p)) { continue; }
                            isEmpty = false;
                            recurse(cur[p], prop ? prop+"."+p : p);
                        }
                        if (isEmpty && prop)
                        {
                            params.push([prop, ""]);
                        }
                    }
                }
                recurse(parsed, "");
            }
            catch(e)
            {
                console.error("postData is not JSON", e.message);
            }
        }
        return params;
    }
}
/**
 * Universal Analytics
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/
 *
 * @class
 * @extends BaseProvider
 */
class UniversalAnalyticsProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "UNIVERSALANALYTICS";
        this._pattern    = /\.(google-analytics\.com|doubleclick\.net)\/(r\/)?collect[\/?]/;
        this._name       = "Universal Analytics";
        this._type       = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "tid",
            "requestType": "omnibug_requestType"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "v": {
                "name": "Protocol Version",
                "group": "General"
            },
            "tid": {
                "name": "Tracking ID",
                "group": "General"
            },
            "aip": {
                "name": "Anonymize IP",
                "group": "General"
            },
            "qt": {
                "name": "Queue Time",
                "group": "General"
            },
            "z": {
                "name": "Cache Buster",
                "group": "General"
            },
            "cid": {
                "name": "Client ID",
                "group": "General"
            },
            "sc": {
                "name": "Session Control",
                "group": "General"
            },
            "dr": {
                "name": "Document Referrer",
                "group": "General"
            },
            "cn": {
                "name": "Campaign Name",
                "group": "Campaign"
            },
            "cs": {
                "name": "Campaign Source",
                "group": "Campaign"
            },
            "cm": {
                "name": "Campaign Medium",
                "group": "Campaign"
            },
            "ck": {
                "name": "Campaign Keyword",
                "group": "Campaign"
            },
            "cc": {
                "name": "Campaign Content",
                "group": "Campaign"
            },
            "ci": {
                "name": "Campaign ID",
                "group": "Campaign"
            },
            "gclid": {
                "name": "Google AdWords ID",
                "group": "Campaign"
            },
            "dclid": {
                "name": "Google Display Ads ID",
                "group": "Campaign"
            },
            "sr": {
                "name": "Screen Resolution",
                "group": "General"
            },
            "vp": {
                "name": "Viewport Size",
                "group": "General"
            },
            "de": {
                "name": "Document Encoding",
                "group": "General"
            },
            "sd": {
                "name": "Screen Colors",
                "group": "General"
            },
            "ul": {
                "name": "User Language",
                "group": "General"
            },
            "je": {
                "name": "Java Enabled",
                "group": "General"
            },
            "fl": {
                "name": "Flash Version",
                "group": "General"
            },
            "t": {
                "name": "Hit Type",
                "group": "General"
            },
            "ni": {
                "name": "Non-Interaction Hit",
                "group": "Events"
            },
            "dl": {
                "name": "Document location URL",
                "group": "General"
            },
            "dh": {
                "name": "Document Host Name",
                "group": "General"
            },
            "dp": {
                "name": "Document Path",
                "group": "General"
            },
            "dt": {
                "name": "Document Title",
                "group": "General"
            },
            "cd": {
                "name": "Content Description",
                "group": "General"
            },
            "an": {
                "name": "Application Name",
                "group": "General"
            },
            "av": {
                "name": "Application Version",
                "group": "General"
            },
            "ec": {
                "name": "Event Category",
                "group": "Events"
            },
            "ea": {
                "name": "Event Action",
                "group": "Events"
            },
            "el": {
                "name": "Event Label",
                "group": "Events"
            },
            "ev": {
                "name": "Event Value",
                "group": "Events"
            },
            "ti": {
                "name": "Transaction ID",
                "group": "Ecommerce"
            },
            "ta": {
                "name": "Transaction Affiliation",
                "group": "Ecommerce"
            },
            "tr": {
                "name": "Transaction Revenue",
                "group": "Ecommerce"
            },
            "ts": {
                "name": "Transaction Shipping",
                "group": "Ecommerce"
            },
            "tt": {
                "name": "Transaction Tax",
                "group": "Ecommerce"
            },
            "in": {
                "name": "Item Name",
                "group": "Ecommerce"
            },
            "ip": {
                "name": "Item Price",
                "group": "Ecommerce"
            },
            "iq": {
                "name": "Item Quantity",
                "group": "Ecommerce"
            },
            "ic": {
                "name": "Item Code",
                "group": "Ecommerce"
            },
            "iv": {
                "name": "Item Category",
                "group": "Ecommerce"
            },
            "cu": {
                "name": "Currency Code",
                "group": "Ecommerce"
            },
            "sn": {
                "name": "Social Network",
                "group": "Events"
            },
            "sa": {
                "name": "Social Action",
                "group": "Events"
            },
            "st": {
                "name": "Social Action Target",
                "group": "Events"
            },
            "utc": {
                "name": "User Timing Category",
                "group": "Timing"
            },
            "utv": {
                "name": "User Timing Variable Name",
                "group": "Timing"
            },
            "utt": {
                "name": "User Timing Time",
                "group": "Timing"
            },
            "utl": {
                "name": "User timing Label",
                "group": "Timing"
            },
            "plt": {
                "name": "Page load time",
                "group": "Timing"
            },
            "dns": {
                "name": "DNS time",
                "group": "Timing"
            },
            "pdt": {
                "name": "Page download time",
                "group": "Timing"
            },
            "rrt": {
                "name": "Redirect response time",
                "group": "Timing"
            },
            "tcp": {
                "name": "TCP connect time",
                "group": "Timing"
            },
            "srt": {
                "name": "Server response time",
                "group": "Timing"
            },
            "exd": {
                "name": "Exception description",
                "group": "Events"
            },
            "exf": {
                "name": "Is exception fatal?",
                "group": "Events"
            },
            "ds": {
                "name": "Data Source",
                "group": "General"
            },
            "uid": {
                "name": "User ID",
                "group": "General"
            },
            "linkid": {
                "name": "Link ID",
                "group": "General"
            },
            "pa": {
                "name": "Product Action",
                "group": "Ecommerce"
            },
            "tcc": {
                "name": "Coupon Code",
                "group": "Ecommerce"
            },
            "pal": {
                "name": "Product Action List",
                "group": "Ecommerce"
            },
            "cos": {
                "name": "Checkout Step",
                "group": "Ecommerce"
            },
            "col": {
                "name": "Checkout Step Option",
                "group": "Ecommerce"
            },
            "promoa": {
                "name": "Promotion Action",
                "group": "Ecommerce"
            },
            "xid": {
                "name": "Content Experiment ID",
                "group": "Google Optimize"
            },
            "xvar": {
                "name": "Content Experiment Variant",
                "group": "Google Optimize"
            },
            "requestType": {
                "hidden": true
            }
        };
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     *
     * @returns {void|{}}
     */
    handleQueryParam(name, value)
    {
        let result = {};
        if(/^cd(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Dimension " + RegExp.$1,
                "value": value,
                "group": "Custom Dimensions"
            };
        } else if(/^cm(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Metric " + RegExp.$1,
                "value": value,
                "group": "Custom Metrics"
            };
        } else if(/^cg(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Content Group " + RegExp.$1,
                "value": value,
                "group": "Content Groups"
            };
        } else if(/^promo(\d+)([a-z]{2})$/i.test(name)) {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "cr": "Creative",
                    "ps": "Position"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Promotion " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Promotions"
            };
        } else if(/^pr(\d+)([a-z]{2})$/i.test(name)) {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "br": "Brand",
                    "ca": "Category",
                    "va": "Variant",
                    "pr": "Price",
                    "qt": "Quantity",
                    "cc": "Coupon Code",
                    "ps": "Position"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Product " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^pr(\d+)(cd|cm)(\d+)$/i.test(name)) {
            let lookup = {
                    "cd": "Custom Dimension",
                    "cm": "Custom Metric"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Product " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)nm$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)pi(\d+)(cd|cm)(\d+)$/i.test(name)) {
            let lookup = {
                    "cd": "Custom Dimension",
                    "cm": "Custom Metric"
                },
                type = lookup[RegExp.$3] || "";
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1 + " Product " + RegExp.$2 + " " + type + " " + RegExp.$4,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)pi(\d+)([a-z]{2})$/i.test(name))
        {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "br": "Brand",
                    "ca": "Category",
                    "va": "Variant",
                    "pr": "Price",
                    "ps": "Position"
                },
                type = lookup[RegExp.$3] || "";
            result = {
                "key": name,
                "field": "Impression List " + RegExp.$1 + " Product " + RegExp.$2 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {string} url
     *
     * @returns {Array}
     */
    handleCustom(url)
    {
        let results = [],
            hitType = url.searchParams.get("t") || "page view",
            requestType = "";

        hitType = hitType.toLowerCase();
        if(hitType === "pageview" || hitType === "screenview") {
            requestType = "Page View";
        } else if(hitType === "transaction" || hitType === "item") {
            requestType = "Ecommerce " + hitType.charAt(0).toUpperCase() + hitType.slice(1);
        } else if(hitType === "dc") {
            requestType = "DoubleClick";
        } else {
            requestType = hitType.charAt(0).toUpperCase() + hitType.slice(1);
        }
        results.push({
            "key":    "omnibug_requestType",
            "value":  requestType,
            "hidden": true
        });

        return results;
    }
}
OmnibugProvider.addProvider(new AdobeAnalyticsProvider());
OmnibugProvider.addProvider(new AdobeAudienceManagerProvider());
OmnibugProvider.addProvider(new AdobeTargetProvider());
OmnibugProvider.addProvider(new OptimizelyXProvider());
OmnibugProvider.addProvider(new UniversalAnalyticsProvider());