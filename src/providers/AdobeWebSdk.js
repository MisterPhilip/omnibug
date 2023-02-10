/**
 * Adobe Analytics
 * http://www.adobe.com/data-analytics-cloud/analytics.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeWebSdkProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEWEBSDK";
        this._pattern    = /\/ee\/.+[&?]configId=[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}/i;
        this._name       = "Adobe Experience Platform Web SDK";
        this._type       = "analytics";
        this._keywords   = ["alloy", "aep", "edge"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "configId",
            "requestType":  "eventName"
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
                "key": "events",
                "name": "Events"
            },
            {
                "key": "query",
                "name": "Query"
            },
            {
                "key": "meta",
                "name": "Metadata"
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
            "configId": {
                "name": "Datastream ID (Config ID)",
                "group": "general"
            },
            "requestId": {
                "name": "Request ID",
                "group": "general"
            },

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
        if(/^meta\./.test(name)) {
            return {
                "key":   name,
                "field": name.replace(/^meta\./g, ""),
                "value": value,
                "group": "meta"
            };
        }
        if(/^query\./.test(name)) {
            return {
                "key":   name,
                "field": name.replace(/^query\./g, ""),
                "value": value,
                "group": "query"
            };
        }
        let eventMatch = name.match(/^events\[(\d+)]\./);
        if(eventMatch && eventMatch.length === 2) {
            return {
                "key":   name,
                "field": name,
                "value": value,
                "group": "events"
            };
        }
        return super.handleQueryParam(name, value);
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
        let results = [];

        params = Array.from(params);

        let requestType = (new URL(url)).pathname.split("/").pop();

        let eventNames = params
            .filter(([key, value]) => /\.eventType$/.test(key))
            .map(([key, value]) => value)
            .join(", ");
        if(!eventNames) {
            eventNames = requestType;
        }

        results.push({
            "key":   "omnibug_requestType",
            "field":   "Request Type",
            "value": requestType,
            "group": "general"
        });
        results.push({
            "key":   "eventName",
            "value": eventNames,
            "hidden": true
        });
        return results;
    }
}
