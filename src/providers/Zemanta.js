/**
 * Zemanta
 * https://www.zemanta.com/
 *
 * @class
 * @extends BaseProvider
 */

class ZemantaProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "ZEMANTA";
        this._pattern   = /zemanta\.com\/(?:v2\/)?p\//;
        this._name      = "Zemanta";
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
            "account":      "omnibug_id",
            "requestType":  "omnibug_requestType",
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
            "id" : {
                "name": "Pixel ID",
                "group": "general"
            },
        };
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
            legacyPixel = /^\/p\//.test(url.pathname),
            pixelVersion = url.pathname.match(/^\/(v\d+)\//i),
            pixelID = url.pathname.match(/\/p\/(?:js\/)?(\d+)\//i),
            eventType = url.pathname.match(/\/js\/\d+\/([^/]+)?/i),
            requestType = "Page View";

        results.push({
            "key":   "pixelType",
            "field": "Pixel Type",
            "value": legacyPixel || ! pixelVersion ? "Legacy" : pixelVersion[1],
            "group": "general",
        });

        results.push({
            "key":   "omnibug_id",
            "field": "Pixel ID",
            "value": pixelID ? pixelID[1] : null,
            "group": "general",
        });
        if(eventType && eventType[1] !== "PAGE_VIEW") {
            requestType = eventType[1];
        }
        results.push({
            "key":   "omnibug_requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}
