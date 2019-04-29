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
        this._pattern    = /demdex\.net\/(ibs|event)[?\/#:]/;
        this._name       = "Adobe Audience Manager";
        this._type       = "visitorid";
        this._keywords   = ["aam"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "requestType": "omnibug_requestType",
            "account": "omnibug_account"
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
                "key": "customer",
                "name": "Customer Attributes"
            },
            {
                "key": "private",
                "name": "Private Attributes"
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
            "caller": {
                "name": "Caller",
                "group": "general"
            },
            "cb": {
                "name": "Callback property",
                "group": "general"
            },
            "cid": {
                "name": "Data Provider (User) IDs",
                "group": "general"
            },
            "ciic": {
                "name": "Integration Code / User ID",
                "group": "general"
            },
            "coppa": {
                "name": "COPPA Request",
                "group": "general"
            },
            "cts": {
                "name": "Return Traits & Segments in Response",
                "group": "general"
            },
            "dpid": {
                "name": "Data Provider ID",
                "group": "general"
            },
            "dpuuid": {
                "name": "Data Provider User ID",
                "group": "general"
            },
            "dst": {
                "name": "Return URL Destination in Response",
                "group": "general"
            },
            "dst_filter": {
                "name": "Adobe Analytics Integration",
                "group": "general"
            },
            "jsonv": {
                "name": "JSON Response Version",
                "group": "general"
            },
            "mid": {
                "name": "Experience Cloud ID",
                "group": "general"
            },
            "nsid": {
                "name": "Name Space ID",
                "group": "general"
            },
            "ptfm": {
                "name": "Platform",
                "group": "general"
            },
            "rs": {
                "name": "Legacy Adobe Analytics Integration",
                "group": "general"
            },
            "rtbd": {
                "name": "Return Method",
                "group": "general"
            },
            "sid": {
                "name": "Score ID",
                "group": "general"
            },
            "tdpid": {
                "name": "Trait Source",
                "group": "general"
            },
            "tdpiic": {
                "name": "Trait Source (Integration Code)",
                "group": "general"
            },
            "uuid": {
                "name": "Unique User ID",
                "group": "general"
            },
        };
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
            params = new URLSearchParams(url.search);

        // Force Adobe's path into query strings
        if(url.pathname.indexOf("/ibs:") === 0) {
            url.pathname.replace("/ibs:", "").split("&").forEach(param => {
                let pair = param.split("=");
                params.append(pair[0], pair[1]);
            });
        }
        for(let param of params)
        {
            let key = param[0],
                value = param[1],
                result = this.handleQueryParam(key, value);
            if(typeof result === "object") {
                data.push(result);
            }
        }

        let customData = this.handleCustom(url, params);
        /* istanbul ignore else */
        if(typeof customData === "object" && customData !== null)
        {
            data = data.concat(customData);
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
        if(/^c_(.+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": name,
                "value": value,
                "group": "custom"
            };
        } else if(/^p_(.+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": name,
                "value": value,
                "group": "private"
            };
        } else if(/^d_(.+)$/i.test(name) && this.keys[RegExp.$1]) {
            result = {
                "key":   name,
                "field": this.keys[RegExp.$1].name,
                "value": value,
                "group": this.keys[RegExp.$1].group
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
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
            accountID = url.hostname.replace(/^(dpm)?.demdex.net/i, ""),
            requestType = url.pathname.match(/^\/([^?\/#:]+)/);
        results.push({
            "key":   "omnibug_account",
            "value": accountID,
            "hidden": true
        });

        if(requestType[1] === "ibs") {
            requestType = "ID Sync";
        } else if(requestType[1] === "event") {
            requestType = "Event";
        } else {
            requestType = requestType[1];
        }
        results.push({
            "key":   "omnibug_requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}