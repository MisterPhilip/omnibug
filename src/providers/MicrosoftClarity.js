/**
 * Microsoft Clarity
 * https://clarity.microsoft.com/
 *
 * @class
 * @extends BaseProvider
 */
class MicrosoftClarityProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "MSCLARITY";
        this._pattern = /clarity\.ms\/tag\//;
        this._name = "Microsoft Clarity";
        this._type = "replay";
        this._keywords = ["heat map", "heatmap", "session record", "click"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account":     "account",
            "requestType": "omnibug_requestType"
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
    handleCustom(url, params) {
        return [
            {
                "key":   "account",
                "field": "Account ID",
                "value": url.pathname.split("/").pop(),
                "group": "general"
            },
            {
                "key": "omnibug_requestType",
                "value": "Library Load",
                "hidden": "true"
            }
        ];
    }
}
