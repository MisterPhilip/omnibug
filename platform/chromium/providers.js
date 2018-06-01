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
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [];
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
                "columns": this.columnMapping,
                "groups":  this.groups
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
            "group": param.group || "other"
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
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general", 
                "name": "General"
            }, 
            {
                "key": "props",
                "name": "Custom Traffic Variables (props)"
            }, 
            {
                "key": "eVars",
                "name": "Custom Conversion Variables (eVars)"
            }, 
            {
                "key": "hier",
                "name": "Hierarchy Variables"
            }, 
            {
                "key": "media",
                "name": "Media Module"
            }, 
            {
                "key": "activity",
                "name": "Activity Map"
            }, 
            {
                "key": "context",
                "name": "Context Data"
            }
        ];
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
                "group": "general"
            },
            "ndh": {
                "name": "Image sent from JS?",
                "group": "general"
            },
            "ch": {
                "name": "Channel",
                "group": "general"
            },
            "v0": {
                "name": "Campaign",
                "group": "general"
            },
            "r": {
                "name": "Referrer URL",
                "group": "general"
            },
            "ce": {
                "name": "Character set",
                "group": "general"
            },
            "cl": {
                "name": "Cookie lifetime",
                "group": "general"
            },
            "g": {
                "name": "Current URL",
                "group": "general"
            },
            "j": {
                "name": "JavaScript version",
                "group": "general"
            },
            "bw": {
                "name": "Browser width",
                "group": "general"
            },
            "bh": {
                "name": "Browser height",
                "group": "general"
            },
            "s": {
                "name": "Screen resolution",
                "group": "general"
            },
            "c": {
                "name": "Screen color depth",
                "group": "general"
            },
            "ct": {
                "name": "Connection type",
                "group": "general"
            },
            "p": {
                "name": "Netscape plugins",
                "group": "general"
            },
            "k": {
                "name": "Cookies enabled?",
                "group": "general"
            },
            "hp": {
                "name": "Home page?",
                "group": "general"
            },
            "pid": {
                "name": "Page ID",
                "group": "general"
            },
            "pidt": {
                "name": "Page ID type",
                "group": "general"
            },
            "oid": {
                "name": "Object ID",
                "group": "general"
            },
            "oidt": {
                "name": "Object ID type",
                "group": "general"
            },
            "ot": {
                "name": "Object tag name",
                "group": "general"
            },
            "pe": {
                "name": "Link type",
                "group": "general"
            },
            "pev1": {
                "name": "Link URL",
                "group": "general"
            },
            "pev2": {
                "name": "Link name",
                "group": "general"
            },
            "pev3": {
                "name": "Video milestone",
                "group": "general"
            },
            "cc": {
                "name": "Currency code",
                "group": "general"
            },
            "t": {
                "name": "Browser time",
                "group": "general"
            },
            "v": {
                "name": "Javascript-enabled browser?",
                "group": "general"
            },
            "pccr": {
                "name": "Prevent infinite redirects",
                "group": "general"
            },
            "vid": {
                "name": "Visitor ID",
                "group": "general"
            },
            "vidn": {
                "name": "New visitor ID",
                "group": "general"
            },
            "fid": {
                "name": "Fallback Visitor ID",
                "group": "general"
            },
            "mid": {
                "name": "Marketing Cloud Visitor ID",
                "group": "general"
            },
            "aid": {
                "name": "Legacy Visitor ID",
                "group": "general"
            },
            "cdp": {
                "name": "Cookie domain periods",
                "group": "general"
            },
            "pageName": {
                "name": "Page name",
                "group": "general"
            },
            "pageType": {
                "name": "Page type",
                "group": "general"
            },
            "server": {
                "name": "Server",
                "group": "general"
            },
            "events": {
                "name": "Events",
                "group": "general"
            },
            "products": {
                "name": "Products",
                "group": "general"
            },
            "purchaseID": {
                "name": "Purchase ID",
                "group": "general"
            },
            "state": {
                "name": "Visitor state",
                "group": "general"
            },
            "vmk": {
                "name": "Visitor migration key",
                "group": "general"
            },
            "vvp": {
                "name": "Variable provider",
                "group": "general"
            },
            "xact": {
                "name": "Transaction ID",
                "group": "general"
            },
            "zip": {
                "name": "ZIP/Postal code",
                "group": "general"
            },
            "rsid": {
                "name": "Report Suites",
                "group": "general"
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
                "columns": this.columnMapping,
                "groups":  this.groups
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
                "group": "props"
            };
        } else if(/^(?:v|eVar)(\d+)$/i.test(name) && name !== "v0") {
            result = {
                "key":   name,
                "field": "eVar" + RegExp.$1,
                "value": value,
                "group": "eVars"
            };
        } else if(/^(?:h|hier)(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Hierarchy " + RegExp.$1,
                "value": value,
                "group": "hier"
            };
        } else if(name.indexOf(".a.media.") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "media"
            };
        } else if(name.indexOf(".a.activitymap.") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "activity"
            };
        } else if(name.indexOf(".") > 0) {
            result = {
                "key":   name,
                "field": name.split(".").pop(),
                "value": value,
                "group": "context"
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
                "group": this.keys.rsid ? this.keys.rsid.group : "general",
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
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            }
        ];
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
                "group": "general"
            },
            "d_rtbd": {
                "name": "Return Method",
                "group": "general"
            },
            "d_cb": {
                "name": "Callback property",
                "group": "general"
            }
        };
    }
}
/**
 * Adobe Heartbeat
 * https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/
 *
 * @class
 * @extends BaseProvider
 */
class AdobeHeartbeatProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEHEARTBEAT";
        this._pattern    = /\.hb\.omtrdc\.net\//;
        this._name       = "Adobe Heartbeat";
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
            "account":      "s:sc:rsid",
            "requestType":  "omnibug_requestType"
        }
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            }
        ];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "s:asset:video_id": {
                "name": "Content ID",
                "group": "general"
            },
            "l:asset:length": {
                "name": "Video Length",
                "group": "general"
            },
            "s:stream:type": {
                "name": "Content Type",
                "group": "general"
            },
            "s:event:sid": {
                "name": "Video Session ID",
                "group": "general"
            },
            "s:sp:player_name": {
                "name": "Content Player Name",
                "group": "general"
            },
            "s:sp:channel": {
                "name": "Content Channel",
                "group": "general"
            },
            "s:asset:name": {
                "name": "Video Name",
                "group": "general"
            },
            "s:sp:sdk": {
                "name": "SDK Version",
                "group": "general"
            },
            "s:sp:hb_version": {
                "name": "VHL Version",
                "group": "general"
            },
            "s:meta:a.media.show": {
                "name": "Show",
                "group": "general"
            },
            "s:meta:a.media.format": {
                "name": "Stream Format",
                "group": "general"
            },
            "s:meta:a.media.season": {
                "name": "Season",
                "group": "general"
            },
            "s:meta:a.media.episode": {
                "name": "Episode",
                "group": "general"
            },
            "s:meta:a.media.asset": {
                "name": "Asset ID",
                "group": "general"
            },
            "s:meta:a.media.genre": {
                "name": "Genre",
                "group": "general"
            },
            "s:meta:a.media.airDate": {
                "name": "First Air Date",
                "group": "general"
            },
            "s:meta:a.media.digitalDate": {
                "name": "First Digital Date",
                "group": "general"
            },
            "s:meta:a.media.rating": {
                "name": "Content Rating",
                "group": "general"
            },
            "s:meta:a.media.originator": {
                "name": "Originator",
                "group": "general"
            },
            "s:meta:a.media.network": {
                "name": "Network",
                "group": "general"
            },
            "s:meta:a.media.type": {
                "name": "Show Type",
                "group": "general"
            },
            "s:meta:a.media.pass.mvpd": {
                "name": "MVPD",
                "group": "general"
            },
            "s:meta:a.media.pass.auth": {
                "name": "Authorized",
                "group": "general"
            },
            "s:meta:a.media.dayPart": {
                "name": "Day Part",
                "group": "general"
            },
            "s:meta:a.media.feed": {
                "name": "Video Feed Type",
                "group": "general"
            },
            "s:meta:a.media.adload": {
                "name": "Ad Load Type",
                "group": "general"
            },
            "s:event:type": {
                "name": "Event Type",
                "group": "general"
            },
            "omnibug_requestType": {
                "hidden": true
            }
        };
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
            event = url.searchParams.get("s:event:type");
        results.push({
            "key":   "omnibug_requestType",
            "value": event.charAt(0).toUpperCase() + event.slice(1),
            "hidden": true
        });
        return results;
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
        this._pattern    = /\.tt\.omtrdc\.net\/(?!cdn\/)/;
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
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "profile",
                "name": "Profile Attributes"
            }
        ];
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
                "group": "general"
            },
            "mboxType": {
                "name": "Mbox Type",
                "group": "general"
            },
            "mboxCount": {
                "name": "Mbox Count",
                "group": "general"
            },
            "mboxId": {
                "name": "Mbox ID",
                "group": "general"
            },
            "mboxSession": {
                "name": "Mbox Session",
                "group": "general"
            },
            "mboxPC": {
                "name": "Mbox PC ID",
                "group": "general"
            },
            "mboxPage": {
                "name": "Mbox Page ID",
                "group": "general"
            },
            "clientCode": {
                "name": "Client Code",
                "group": "general"
            },
            "mboxHost": {
                "name": "Page Host",
                "group": "general"
            },
            "mboxURL": {
                "name": "Page URL",
                "group": "general"
            },
            "mboxReferrer": {
                "name": "Page Referrer",
                "group": "general"
            },
            "screenHeight": {
                "name": "Screen Height",
                "group": "general"
            },
            "screenWidth": {
                "name": "Screen Width",
                "group": "general"
            },
            "browserWidth": {
                "name": "Browser Width",
                "group": "general"
            },
            "browserHeight": {
                "name": "Browser Height",
                "group": "general"
            },
            "browserTimeOffset": {
                "name": "Browser Timezone Offset",
                "group": "general"
            },
            "colorDepth": {
                "name": "Browser Color Depth",
                "group": "general"
            },
            "mboxXDomain": {
                "name": "CrossDomain Enabled",
                "group": "general"
            },
            "mboxTime": {
                "name": "Timestamp",
                "group": "general"
            },
            "mboxVersion": {
                "name": "Library Version",
                "group": "general"
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
        if(name.indexOf("profile.") === 0) {
            result = {
                "key":   name,
                "field": name.slice(8),
                "value": value,
                "group": "profile"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
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
                "group": "general"
            });
            results.push({
                "key":   "mboxType",
                "field": "Mbox Type",
                "value": matches[2],
                "group": "general"
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
 * Segment
 * https://segment.com/
 *
 * @class
 * @extends BaseProvider
 */
class SegmentProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "SEGMENT";
        this._pattern    = /api\.segment\.io\//;
        this._name       = "Segment";
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
            "requestType":  "omnibug_requestType"
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
            action = url.pathname.match(/\/v1\/([^\/]+)$/);
        if(action) {
            let type = action[1].toLowerCase();
            if(type === "p" || type === "page") {
                type = "Page";
            } else if(type === "i" || type === "identify") {
                type = "Identify";
            } else if(type === "t" || type === "track") {
                type = "Track";
            } else if(type === "s" || type === "screen") {
                type = "Screen";
            } else if(type === "g" || type === "group") {
                type = "Group";
            } else if(type === "a" || type === "alias") {
                type = "Alias";
            } else if(type === "b" || type === "batch") {
                type = "Batch";
            }

            results.push({
                "key":   "omnibug_requestType",
                "value": type,
                "hidden": true
            });
        }
        return results;
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
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "campaign",
                "name": "Campaign"
            },
            {
                "key": "events",
                "name": "Events"
            },
            {
                "key": "ecommerce",
                "name": "Ecommerce"
            },
            {
                "key": "timing",
                "name": "Timing"
            },
            {
                "key": "dimension",
                "name": "Custom Dimensions"
            },
            {
                "key": "metric",
                "name": "Custom Metrics"
            },
            {
                "key": "promo",
                "name": "Promotions"
            },
            {
                "key": "optimize",
                "name": "Google Optimize"
            },
            {
                "key": "contentgroup",
                "name": "Content Group"
            }
        ];
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
                "group": "general"
            },
            "tid": {
                "name": "Tracking ID",
                "group": "general"
            },
            "aip": {
                "name": "Anonymize IP",
                "group": "general"
            },
            "qt": {
                "name": "Queue Time",
                "group": "general"
            },
            "z": {
                "name": "Cache Buster",
                "group": "general"
            },
            "cid": {
                "name": "Client ID",
                "group": "general"
            },
            "sc": {
                "name": "Session Control",
                "group": "general"
            },
            "dr": {
                "name": "Document Referrer",
                "group": "general"
            },
            "cn": {
                "name": "Campaign Name",
                "group": "campaign"
            },
            "cs": {
                "name": "Campaign Source",
                "group": "campaign"
            },
            "cm": {
                "name": "Campaign Medium",
                "group": "campaign"
            },
            "ck": {
                "name": "Campaign Keyword",
                "group": "campaign"
            },
            "cc": {
                "name": "Campaign Content",
                "group": "campaign"
            },
            "ci": {
                "name": "Campaign ID",
                "group": "campaign"
            },
            "gclid": {
                "name": "Google AdWords ID",
                "group": "campaign"
            },
            "dclid": {
                "name": "Google Display Ads ID",
                "group": "campaign"
            },
            "sr": {
                "name": "Screen Resolution",
                "group": "general"
            },
            "vp": {
                "name": "Viewport Size",
                "group": "general"
            },
            "de": {
                "name": "Document Encoding",
                "group": "general"
            },
            "sd": {
                "name": "Screen Colors",
                "group": "general"
            },
            "ul": {
                "name": "User Language",
                "group": "general"
            },
            "je": {
                "name": "Java Enabled",
                "group": "general"
            },
            "fl": {
                "name": "Flash Version",
                "group": "general"
            },
            "t": {
                "name": "Hit Type",
                "group": "general"
            },
            "ni": {
                "name": "Non-Interaction Hit",
                "group": "events"
            },
            "dl": {
                "name": "Document location URL",
                "group": "general"
            },
            "dh": {
                "name": "Document Host Name",
                "group": "general"
            },
            "dp": {
                "name": "Document Path",
                "group": "general"
            },
            "dt": {
                "name": "Document Title",
                "group": "general"
            },
            "cd": {
                "name": "Content Description",
                "group": "general"
            },
            "an": {
                "name": "Application Name",
                "group": "general"
            },
            "av": {
                "name": "Application Version",
                "group": "general"
            },
            "ec": {
                "name": "Event Category",
                "group": "events"
            },
            "ea": {
                "name": "Event Action",
                "group": "events"
            },
            "el": {
                "name": "Event Label",
                "group": "events"
            },
            "ev": {
                "name": "Event Value",
                "group": "events"
            },
            "ti": {
                "name": "Transaction ID",
                "group": "ecommerce"
            },
            "ta": {
                "name": "Transaction Affiliation",
                "group": "ecommerce"
            },
            "tr": {
                "name": "Transaction Revenue",
                "group": "ecommerce"
            },
            "ts": {
                "name": "Transaction Shipping",
                "group": "ecommerce"
            },
            "tt": {
                "name": "Transaction Tax",
                "group": "ecommerce"
            },
            "in": {
                "name": "Item Name",
                "group": "ecommerce"
            },
            "ip": {
                "name": "Item Price",
                "group": "ecommerce"
            },
            "iq": {
                "name": "Item Quantity",
                "group": "ecommerce"
            },
            "ic": {
                "name": "Item Code",
                "group": "ecommerce"
            },
            "iv": {
                "name": "Item Category",
                "group": "ecommerce"
            },
            "cu": {
                "name": "Currency Code",
                "group": "ecommerce"
            },
            "sn": {
                "name": "Social Network",
                "group": "events"
            },
            "sa": {
                "name": "Social Action",
                "group": "events"
            },
            "st": {
                "name": "Social Action Target",
                "group": "events"
            },
            "utc": {
                "name": "User Timing Category",
                "group": "timing"
            },
            "utv": {
                "name": "User Timing Variable Name",
                "group": "timing"
            },
            "utt": {
                "name": "User Timing Time",
                "group": "timing"
            },
            "utl": {
                "name": "User timing Label",
                "group": "timing"
            },
            "plt": {
                "name": "Page load time",
                "group": "timing"
            },
            "dns": {
                "name": "DNS time",
                "group": "timing"
            },
            "pdt": {
                "name": "Page download time",
                "group": "timing"
            },
            "rrt": {
                "name": "Redirect response time",
                "group": "timing"
            },
            "tcp": {
                "name": "TCP connect time",
                "group": "timing"
            },
            "srt": {
                "name": "Server response time",
                "group": "timing"
            },
            "exd": {
                "name": "Exception description",
                "group": "events"
            },
            "exf": {
                "name": "Is exception fatal?",
                "group": "events"
            },
            "ds": {
                "name": "Data Source",
                "group": "general"
            },
            "uid": {
                "name": "User ID",
                "group": "general"
            },
            "linkid": {
                "name": "Link ID",
                "group": "general"
            },
            "pa": {
                "name": "Product Action",
                "group": "ecommerce"
            },
            "tcc": {
                "name": "Coupon Code",
                "group": "ecommerce"
            },
            "pal": {
                "name": "Product Action List",
                "group": "ecommerce"
            },
            "cos": {
                "name": "Checkout Step",
                "group": "ecommerce"
            },
            "col": {
                "name": "Checkout Step Option",
                "group": "ecommerce"
            },
            "promoa": {
                "name": "Promotion Action",
                "group": "ecommerce"
            },
            "xid": {
                "name": "Content Experiment ID",
                "group": "optimize"
            },
            "xvar": {
                "name": "Content Experiment Variant",
                "group": "optimize"
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
                "group": "dimension"
            };
        } else if(/^cm(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Metric " + RegExp.$1,
                "value": value,
                "group": "metric"
            };
        } else if(/^cg(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Content Group " + RegExp.$1,
                "value": value,
                "group": "contentgroup"
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
                "group": "promo"
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
                "group": "ecommerce"
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
                "group": "ecommerce"
            };
        } else if(/^il(\d+)nm$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1,
                "value": value,
                "group": "ecommerce"
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
                "group": "ecommerce"
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
                "group": "ecommerce"
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
OmnibugProvider.addProvider(new AdobeHeartbeatProvider());
OmnibugProvider.addProvider(new AdobeTargetProvider());
OmnibugProvider.addProvider(new OptimizelyXProvider());
OmnibugProvider.addProvider(new SegmentProvider());
OmnibugProvider.addProvider(new UniversalAnalyticsProvider());