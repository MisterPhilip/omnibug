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
        if(pev2 === "e") {
            requestType = "Exit";
        } else if(pev2 === "d") {
            requestType = "Download";
        } else if(pev2 === "o") {
            requestType = "Other";
        }
        results.push({
            "key":   "requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}
OmnibugProvider.addProvider(new AdobeAnalyticsProvider());