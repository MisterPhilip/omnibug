/**
 * Outbrain

 *
 * @class
 * @extends BaseProvider
 */

class OutbrainProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "OUTBRAIN";
        this._pattern   = /tr\.outbrain\.com\//;
        this._name      = "Outbrain";
        this._type      = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "marketerId",
            "requestType":  "requestTypeParsed"
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
                "key": "event",
                "name": "Event Data"
            },
            {
                "key": "configuration",
                "name": "Configuration"
            },
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
            "name" : {
                "name": "Event Name",
                "group": "general"
            },
            "dl" : {
                "name": "Page URL",
                "group": "general"
            },
            "optOut" : {
                "name": "Opt Out",
                "group": "general"
            },
            "bust" : {
                "name": "Cache Buster",
                "group": "other"
            },
            "orderId" : {
                "name": "Order ID",
                "group": "event"
            },
            "orderValue" : {
                "name": "Order Value",
                "group": "event"
            },
            "currency" : {
                "name": "Currency",
                "group": "event"
            },
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     * @param    {object}   params
     *
     * @returns {void|Array}
     */
    handleCustom(url, params)
    {
        let eventType = params.get("name") || "Other";
        return [{
            "key":   "requestTypeParsed",
            "value": eventType === "PAGE_VIEW" ? "Page View" : eventType,
            "hidden": true
        }];
    }
}
