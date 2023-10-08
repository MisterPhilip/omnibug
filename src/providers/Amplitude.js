/**
 * Amplitude
 * https://www.amplitude.com/
 * https://www.docs.developers.amplitude.com/data/sdks/browser-2/
 *
 * @class
 * @extends BaseProvider
 */
class AmplitudeProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "AMPLITUDE";
        this._pattern = /amplitude\.com\/2\/httpapi/;
        this._name = "Amplitude";
        this._type = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "api_key",
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
            "api_key": {
                "name": "API Key",
                "group": "general"
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
    handleQueryParam(name, value)
    {
        if(/^events\[/i.test(name)) {
            return {
                "key":   name,
                "field": name,
                "value": value,
                "group": "events"
            };
        }
        return super.handleQueryParam(name, value);
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

        params.forEach((value, key) => {
            if(/\.event_type$/.test(key)) {
                requestType.push(value);
            }
        });

        if(requestType.length) {
            requestType = `(${requestType.length}) ${requestType.join(", ")}`;
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
