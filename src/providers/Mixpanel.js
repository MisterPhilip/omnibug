/**
 * Mixpanel
 * https://developer.mixpanel.com/reference/overview
 *
 * @class
 * @extends BaseProvider
 */
class MixpanelProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "MIXPANEL";
        this._pattern = /mixpanel.com\/(?:engage|track)/;
        this._name = "Mixpanel";
        this._type = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "token",
            "requestType": "requestTypeParsed"
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
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "pm": {
                "name": "Tracking ID",
                "group": "general"
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
        const original = super.parsePostData(postData),
            dataField = original.find(([key, value]) => key === "data");
        if(dataField) {
            return super.parsePostData(dataField[1]);
        }

        return original;
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
            requestType = [],
            foundToken = false;

        params.forEach((value, key) => {
            if(/(?:^|\.)event$/.test(key)) {
                value = value.replace("$mp_web_page_view", "Page View");
                requestType.push(value);
            }
            if(!foundToken && /properties\.token$/.test(key)) {
                results.push({
                    "key": "token",
                    "value": value,
                    "hidden": true
                });
                foundToken = true;
            }
        });

        if(requestType.length) {
            requestType = ((requestType.length > 1) ? `(${requestType.length}) ` : ``) + `${requestType.join(", ")}`;
        } else {
            requestType = "Other";
        }

        results.push({
            "key": "requestTypeParsed",
            "value": requestType,
            "hidden": true
        });

        return results;
    }
}
