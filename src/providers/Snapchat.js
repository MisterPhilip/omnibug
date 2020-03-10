/**
 * Snap Pixel (Snapchat)
 * https://businesshelp.snapchat.com/en-US/article/snap-pixel-about
 *
 * @class
 * @extends BaseProvider
 */
class SnapchatProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "SNAPCHATPIXEL";
        this._pattern = /tr\.snapchat\.com\/p/;
        this._name = "Snapchat";
        this._type = "marketing";
        this._keywords = ["snap pixel", "snaptr"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "pid",
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
                "key": "ecommerce",
                "name": "E-Commerce"
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
            "pid": {
                "name": "Pixel ID",
                "group": "general"
            },
            "ev": {
                "name": "Event",
                "group": "general"
            },
            "pl": {
                "name": "Page URL",
                "group": "general"
            },
            "ts": {
                "name": "Timestamp",
                "group": "other"
            },
            "rf": {
                "name": "Referrer",
                "group": "general"
            },
            "v": {
                "name": "Pixel Version",
                "group": "other"
            },
            "u_hem": {
                "name": "User Email (Hashed)",
                "group": "general"
            },
            "u_hpn": {
                "name": "User Phone Number (Hashed)",
                "group": "general"
            },
            "e_desc": {
                "name": "Description",
                "group": "events"
            },
            "e_sm": {
                "name": "Sign Up Method",
                "group": "events"
            },
            "e_su": {
                "name": "Success",
                "group": "events"
            },
            "e_ni": {
                "name": "Number of Items",
                "group": "ecommerce"
            },
            "e_iids": {
                "name": "Item IDs",
                "group": "ecommerce"
            },
            "e_ic": {
                "name": "Item Category",
                "group": "ecommerce"
            },
            "e_pia": {
                "name": "Payment Info Available",
                "group": "ecommerce"
            },
            "e_cur": {
                "name": "Currency",
                "group": "ecommerce"
            },
            "e_pr": {
                "name": "Price",
                "group": "ecommerce"
            },
            "e_tid": {
                "name": "Transaction ID",
                "group": "ecommerce"
            },
            "e_ss": {
                "name": "Search Keyword",
                "group": "events"
            }
        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array|Object}
     */
    parsePostData(postData = "") {
        let params = [];
        // Handle POST data first, if applicable (treat as query params)
        /* istanbul ignore else: fallback */
        if (typeof postData === "string" && postData !== "") {
            let keyPairs = postData.split("&");
            keyPairs.forEach((keyPair) => {
                let splitPair = keyPair.split("=");
                params.push([splitPair[0], decodeURIComponent(splitPair[1] || "")]);
            });
        } else if (typeof postData === "object") {
            Object.entries(postData).forEach((entry) => {
                // @TODO: consider handling multiple values passed?
                params.push([entry[0], entry[1].toString()]);
            });
        }
        return params;
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
            event = params.get("ev") || /* istanbul ignore next: fallback */ "other",
            requestType = event.toLowerCase();
        
        requestType = requestType.split("_").map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(" ");

        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": true
        });

        return results;
    }
}