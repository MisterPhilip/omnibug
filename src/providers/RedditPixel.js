/**
 * Reddit Pixel
 * https://reddit.my.site.com/helpcenter/s/article/Install-the-Reddit-Pixel-on-your-website
 *
 * @class
 * @extends BaseProvider
 */
class RedditPixelProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "REDDITPIXEL";
        this._pattern = /reddit\.com\/rp\.gif/;
        this._name = "Reddit Pixel";
        this._type = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "id",
            "requestType": "_requestType",
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
                "key": "event",
                "name": "Event Data"
            }
        ];
    }

    /**
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "id": {
                "name": "Account ID",
                "group": "general"
            },
            "event": {
                "name": "Event Name",
                "group": "event"
            },
            "m.customEventName": {
                "name": "Custom Event Name",
                "group": "event"
            },
            "m.itemCount": {
                "name": "Item Count",
                "group": "event"
            },
            "m.value": {
                "name": "Value",
                "group": "event"
            },
            "m.valueDecimal": {
                "name": "Value (Decimal)",
                "group": "event"
            },
            "m.currency": {
                "name": "Currency",
                "group": "event"
            },
            "m.products": {
                "name": "Products",
                "group": "event"
            },
            "m.conversionId": {
                "name": "Conversion ID",
                "group": "event"
            }
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
        const results = [];

        results.push({
            "key": "_requestType",
            "value": params.get("m.customEventName") || params.get("event"),
            "hidden": true,
        });

        return results;
    }
}
