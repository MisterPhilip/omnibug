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
        this._pattern    = /^([^#?]+)(\/b\/ss\/)|\.2o7\.net\/|\.sc\d?\.omtrdc\.net\/(?!id)/;
        this._name       = "Adobe Analytics";
        this._type       = "analytics";
        this._keywords   = ["aa", "site catalyst", "sitecatalyst", "omniture"];
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
        };
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
                "key": "listvar",
                "name": "List Variables"
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
            },
            {
                "key": "customerid",
                "name": "Customer ID"
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
                "group": "other"
            },
            "ch": {
                "name": "Channel",
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
                "group": "other"
            },
            "g": {
                "name": "Current URL",
                "group": "general"
            },
            "bw": {
                "name": "Browser width",
                "group": "other"
            },
            "bh": {
                "name": "Browser height",
                "group": "other"
            },
            "s": {
                "name": "Screen resolution",
                "group": "other"
            },
            "c": {
                "name": "Screen color depth",
                "group": "other"
            },
            "ct": {
                "name": "Connection type",
                "group": "other"
            },
            "p": {
                "name": "Netscape plugins",
                "group": "other"
            },
            "k": {
                "name": "Cookies enabled?",
                "group": "other"
            },
            "hp": {
                "name": "Home page?",
                "group": "other"
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
                "group": "other"
            },
            "v": {
                "name": "Javascript-enabled browser?",
                "group": "other"
            },
            "pccr": {
                "name": "Prevent infinite redirects",
                "group": "other"
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
            "mcorgid ": {
                "name": "Marketing Cloud Org ID",
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
                "group": "other"
            },
            "vvp": {
                "name": "Variable provider",
                "group": "other"
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

        data = data.concat(this.handleCustom(url, params));

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
        } else if(/^(?:v|eVar)(\d+)$/i.test(name)) {
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
        } else if(/^(?:l|list)(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "List Var " + RegExp.$1,
                "value": value,
                "group": "listvar"
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
        } else if(name.indexOf("cid.") === 0) {
            result = {
                "key":   name,
                "field": name.replace("cid.", ""),
                "value": value,
                "group": "customerid"
            };
        } else if(name.indexOf(".") > 0) {
            result = {
                "key":   name,
                "field": name.replace("c.", ""),
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
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array|Object}
     */
    parsePostData(postData = "") {
        let params = [];
        // Handle POST data first, if applicable (treat as query params)
        if (typeof postData === "string" && postData !== "") {
            let keyPairs = postData.split("&");
            keyPairs.forEach((keyPair) => {
                let splitPair = keyPair.split("=");
                params.push([splitPair[0], decodeURIComponent(splitPair[1] || "")]);
            });
        } else if (typeof postData === "object") {
            Object.entries(postData).forEach((entry) => {
                // @TODO: consider handling multiple values passed?
                params.push([entry[0], entry[1].toString()]);
            });
        }
        return params;
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     * @param    {object}   params
     *
     * @returns {Array}
     */
    handleCustom(url, params)
    {
        let results = [],
            rsid = url.pathname.match(/\/b\/ss\/([^/]+)\//),
            jsVersion = url.pathname.match(/\/(JS-[^/]+)\//i),
            pev2 = params.get("pe"),
            requestType = "Page View";
        if(rsid) {
            results.push({
                "key":   "rsid",
                "field": this.keys.rsid ? this.keys.rsid.name : "Report Suites",
                "value": rsid[1],
                "group": this.keys.rsid ? this.keys.rsid.group : "general",
            });
        }
        if(jsVersion) {
            results.push({
                "key":   "version",
                "field": this.keys.version ? this.keys.version.name : "JavaScript Version",
                "value": jsVersion[1],
                "group": this.keys.version ? this.keys.version.group : "general",
            });
        }
        results.push({
            "key":   "trackingServer",
            "field": "Tracking Server",
            "value": url.hostname,
            "group": "general",
        });

        // Handle s.tl calls
        if(pev2 === "lnk_e") {
            requestType = "Exit Click";
        } else if(pev2 === "lnk_d") {
            requestType = "Download Click";
        } else if(pev2 === "lnk_o") {
            requestType = "Other Click";
        } else if(/^m_/.test(pev2)) {
            requestType = "Media";
        }
        results.push({
            "key":   "requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}