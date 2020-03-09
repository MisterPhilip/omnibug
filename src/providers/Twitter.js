/**
 * Twitter Conversions
 * https://business.twitter.com/
 *
 * @class
 * @extends BaseProvider
 */
class TwitterProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "TWITTERPIXEL";
        this._pattern = /analytics\.twitter\.com\/i\/adsct/;
        this._name = "Twitter Conversion";
        this._type = "marketing";
        this._keywords = ["twitter", "t.co", "tweet", "uwt.js", "oct.js"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "txn_id",
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
            "txn_id": {
                "name": "Tag ID",
                "group": "general"
            },
            "p_id": {
                "name": "Pixel Type",
                "group": "general"
            },
            "p_user_id": {
                "name": "User ID",
                "group": "general"
            },
            "events": {
                "name": "Event Data",
                "group": "general"
            },
            "tw_sale_amount": {
                "name": "Revenue",
                "group": "general"
            },
            "tw_order_quantity": {
                "name": "Quantity",
                "group": "general"
            },
            "tpx_cb": {
                "name": "Callback",
                "group": "other"
            },
            "tw_iframe_status": {
                "name": "Is an iFrame",
                "group": "other"
            },
            "tw_document_href": {
                "name": "Page URL",
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
            events = params.get("events"),
            requestType = "other";

        /* istanbul ignore else: nothing happens */
        if (events) {
            try {
                let parsedEvents = JSON.parse(events),
                    requestTypes = [];

                (parsedEvents || /* istanbul ignore next: fallback */[]).forEach(([type, ...data]) => {
                    type = type === "pageview" ? "Page View" : type;
                    requestTypes.push(type);
                });
                requestType = requestTypes.join("|");
            } catch (e) {
                /* istanbul ignore next */
                console.error(e.message);
            }
        }

        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": true
        });

        return results;
    }
}