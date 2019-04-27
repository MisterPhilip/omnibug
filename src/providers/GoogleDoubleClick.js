/**
 * Google DoubleClick
 * https://marketingplatform.google.com/about/enterprise/
 *
 * @class
 * @extends BaseProvider
 */
class GoogleDoubleClickProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "DOUBLECLICK";
        this._pattern    = /fls\.doubleclick\.net\/activityi(?!.*dc_pre);/;
        this._name       = "Google DoubleClick";
        this._type       = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "account",
            "requestType":  "type"
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
                "key": "custom",
                "name": "Custom Fields"
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
            "src": {
                "name": "Account ID",
                "group": "general"
            },
            "type": {
                "name": "Activity Group",
                "group": "general"
            },
            "cat": {
                "name": "Activity Tag",
                "group": "general"
            },
            "cost": {
                "name": "Value",
                "group": "general"
            },
            "qty": {
                "name": "Quantity",
                "group": "general"
            },
            "num": {
                "name": "Request Cache Buster",
                "group": "other"
            },
            "dc_lat": {
                "name": "Limit Ad Tracking",
                "group": "other"
            },
            "tag_for_child_directed_treatment": {
                "name": "COPPA Request",
                "group": "other"
            },
            "tfua": {
                "name": "User Underage",
                "group": "other"
            },
            "npa": {
                "name": "Opt-out of Remarketing",
                "group": "other"
            },
            "ord": {
                "hidden": true
            }
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

        // Force Google's path into query strings
        url.pathname.replace("/activityi;", "").split(";").forEach(param => {
            let pair = param.split("=");
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
        if(/^u(\d+)$/i.test(name)) {
            result = {
                "key": name,
                "field": "Custom Field " + RegExp.$1,
                "value": value,
                "group": "custom"
            };
        } else if(name === "~oref") {
            result = {
                "key": name,
                "field": "Page URL",
                "value": decodeURIComponent(value),
                "group": "general"
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
            account = "DC-" + params.get("src"),
            ord = params.get("ord"),
            countingMethod = "per_session";

        if(ord) {
            if(params.get("qty")) {
                results.push({
                    "key":   "ord",
                    "field": "Transaction ID",
                    "value": ord,
                    "group": "general"
                });
                countingMethod = "transactions / items_sold";
            } else {
                results.push({
                    "key":   "ord",
                    "field": "Counting Method Type",
                    "value": ord,
                    "group": "other"
                });
                countingMethod = (ord === "1") ? "unique" : "standard";
            }
        }

        results.push({
            "key":   "countingMethod",
            "field": "Counting Method",
            "value": countingMethod,
            "group": "general"
        });

        results.push({
            "key":   "account",
            "value": account,
            "hidden": true
        });

        return results;
    }
}