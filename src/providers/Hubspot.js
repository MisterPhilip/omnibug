/**
 * Hubspot
 * https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code
 *
 * @class
 * @extends BaseProvider
 */

class HubspotProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "HUBSPOT";
        this._pattern   = /track\.hubspot\.com\/__ptq\.gif/;
        this._name      = "Hubspot";
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
            "account":      "a",
            "requestType":  "omnibug_requestType"
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
                "name": "Event Data"
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
            "ct" : {
                "name": "Content Type",
                "group": "general"
            },
            "pu" : {
                "name": "Page URL",
                "group": "general"
            },
            "t" : {
                "name": "Page Title",
                "group": "general"
            },
            "po" : {
                "name": "Page Path",
                "group": "general"
            },
            "id" : {
                "name": "Event Name",
                "group": "events"
            },
            "value" : {
                "name": "Event Value",
                "group": "events"
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
    handleCustom(url, params) {
        return [
            {
                "key":   "omnibug_requestType",
                "value": params.get("id") ? params.get("id") : "Page View",
                "hidden": true
            }
        ];
    }
}
