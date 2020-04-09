/**
 * Bing Ads UET
 * https://about.ads.microsoft.com/en-us/solutions/audience-targeting/universal-event-tracking
 *
 * @class
 * @extends BaseProvider
 */
class BingAdsProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "BINGUET";
        this._pattern = /bat\.bing\.com\/action/;
        this._name = "Bing Ads";
        this._type = "marketing";
        this._keywords = ["UET", "uetq", "Microsoft", "MSN", "atdmt", "bat.js"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "ti",
            "requestType": "requestType"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups() {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "events",
                "name": "Events"
            }
        ];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "ti": {
                "name": "Tag ID",
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
            "gv": {
                "name": "Goal Revenue",
                "group": "events"
            },
            "prodid": {
                "name": "Product ID",
                "group": "events"
            },
            "pagetype": {
                "name": "Page Type",
                "group": "general"
            },
            "evt": {
                "name": "Event Type",
                "group": "general"
            },
            "spa": {
                "name": "Single Page App",
                "group": "general"
            },
            "page_path": {
                "name": "Page Path",
                "group": "general"
            },
            "p": {
                "name": "Page URL",
                "group": "general"
            },
            "tl": {
                "name": "Page Title",
                "group": "other"
            },
            "kw": {
                "name": "Keywords Meta Tag",
                "group": "other"
            },
            "r": {
                "name": "Page Referrer",
                "group": "other"
            }
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
    handleCustom(url, params) {
        let results = [],
            event = params.get("evt"),
            requestType = "other";

        if (event === "pageLoad") {
            requestType = "Page View";
        } else {
            requestType = event.charAt(0).toUpperCase() + event.slice(1);
        }

        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": true
        });

        return results;
    }
}