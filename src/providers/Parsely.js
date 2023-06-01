/**
 * Parse.ly
 * https://docs.parse.ly/tracking-code-setup/
 *
 * @class
 * @extends BaseProvider
 */
class ParselyProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "PARSELY";
        this._pattern    = /https?:\/\/((p1(-irl)?|srv\.pixel)\.parsely\.com|fpa-events\..*)\/p(logger|x)\/\?rand=/;
        this._name       = "Parse.ly";
        this._type       = "analytics";
        this._keywords   = ["parsely", "parse.ly"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "idsite",
            "requestType": "omnibug_requestType"
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
                "key": "conversions",
                "name": "Conversion Data"
            },
            {
                "key": "segments",
                "name": "Segment Data"
            },
            {
                "key": "metadata",
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
            "idsite": {
                "name": "Site ID",
                "group": "general"
            },
            "url": {
                "name": "Page URL",
                "group": "general"
            },
            "urlref": {
                "name": "Referring URL",
                "group": "general"
            },
            "action": {
                "name": "Event Type",
                "group": "general"
            },
            "inc": {
                "name": "Engaged Time Increment",
                "group": "general"
            },
            "u": {
                "name": "Visitor ID",
                "group": "general"
            },
            "data": {
                "name": "Extra Data",
                "group": "general"
            },
            "metadata": {
                "name": "Metadata",
                "group": "metadata"
            },
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {object}   url
     * @param    {object}   params
     *
     * @returns {Array}
     */
    handleCustom(url, params)
    {
        let results = [],
            hitType = params.get("action"),
            requestType = "";

        hitType = hitType.toLowerCase();
        if(hitType === "pageview") {
            requestType = "Page View";
        } else if(hitType === "heartbeat") {
            requestType = "Heartbeat";
        } else if(hitType === "conversion") {
            requestType = "Conversion";
        } else if(hitType === "videostart") {
            requestType = "Video Start";
        } else if(hitType === "vheartbeat") {
            requestType = "Video Heartbeat";
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
