/**
 * Criteo OneTag
 * https://www.criteo.com/
 *
 * @class
 * @extends BaseProvider
 */

class CriteoOneTagProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "CRITEOONETAG";
        this._pattern = /sslwidget\.criteo\.com\/event/;
        this._name = "Criteo OneTag";
        this._type = "marketing";
    }

    /**
   * Retrieve the column mappings for default columns (account, event type)
   *
   * @return {{}}
   */
    get columnMapping() {
        return {
            account: "a",
            requestType: "requestType"
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
                key: "general",
                name: "General"
            },
            {
                key: "events",
                name: "Events"
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
            "a": {
                "name": "Account ID",
                "group": "general"
            },
            "v": {
                "name": "Tag Version",
                "group": "other"
            },
            "tld": {
                "name": "Top-Level Domain",
                "group": "other"
            }
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
    handleQueryParam(name, value) {
        let result = {}, x = false;
        if (x) {
            // do nothing
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
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
            requestType = [];

        // Grab the request type - in the future we'll attempt to better parse the actual results
        params.forEach((value, key) => {
            if (/^p\d+$/.test(key)) {
                let values = value.split("&");
                if (/^e=/.test(values[0])) {
                    let type = this._handleEventName(values[0].split("=")[1]);
                    if (type) {
                        requestType.push(type);
                    }
                }
            }
        });

        results.push({
            "key": "requestType",
            "value": requestType.length ? requestType.join(" | ") : "other",
            "hidden": true
        });

        return results;
    }

    _handleEventName(name) {
        let lookupTable = {
            "vh": "Homepage",
            "vl": "Search Listing View",
            "vp": "Product View",
            "vb": "Cart View",
            "vc": "Purchase"
        };
        return lookupTable[name] ? lookupTable[name] : false;
    }
}
