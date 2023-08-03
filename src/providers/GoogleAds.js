/**
 * Google Ads
 * https://ads.google.com/
 *
 * @class
 * @extends BaseProvider
 */
class GoogleAdsProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "GOOGLEADS";
        this._pattern = /\/pagead\/(?:viewthrough)conversion/;
        this._name = "Google Ads";
        this._type = "marketing";
        this._keywords = ["aw", "ad words"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "omnibug-account",
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
            "url": {
                "name": "Page URL",
                "group": "general"
            },
            "tiba": {
                "name": "Page Title",
                "group": "general"
            },
            "data": {
                "name": "Event Data",
                "group": "general"
            },
            "label": {
                "name": "Conversion Label",
                "group": "general"
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
            pathParts = url.pathname.match(/\/([^/]+)\/(?:AW-)?(\d+)\/?$/),
            account = "AW-" + pathParts[2],
            data = params.get("data") || "",
            dataEvent = data.match(/event=([^;]+)(?:$|;)/),
            requestType = "";

        /* istanbul ignore else */
        if (account) {
            results.push({
                "key": "account",
                "field": "Account ID",
                "value": account,
                "group": "general"
            });

            // Add the conversion label, if available, to the accounts column
            if (params.get("label")) {
                account += "/" + params.get("label");
            }
            results.push({
                "key": "omnibug-account",
                "value": account,
                "hidden": true
            });
        }

        if (dataEvent && dataEvent.length) {
            if (dataEvent[1] === "gtag.config") {
                requestType = "Page View";
            } else {
                requestType = dataEvent[1];
            }
        } else {
            requestType = (pathParts[1] === "viewthroughconversion") ? "Conversion" : pathParts[1].replace("viewthrough", "");
        }

        results.push({
            "key": "requestType",
            "value": requestType,
            "field": "Request Type",
            "group": "general"
        });

        return results;
    }
}
