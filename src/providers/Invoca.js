/**
 * Invoca
 * https://community.invoca.com/t5/developer-features/an-introduction-to-invocajs-the-technology-behind-your-invoca/ta-p/562
 *
 * @class
 * @extends BaseProvider
 */
class InvocaProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "INVOCA";
        this._pattern = /solutions\.invocacdn\.com\/.*\/tag-(draft|live)\.js/;
        this._name = "Invoca";
        this._type = "marketing";
        this._keywords = ["call"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account":     "account",
            "requestType":  "_requestType",
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
            }
        ];
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
        const libraryType = url.pathname.match(/\/tag-([^.]+)\.js/)[1];
        return [
            {
                "key":   "account",
                "field": "Account ID",
                "value": url.pathname.match(/\/(\d+\/\d+)\/tag-/)[1],
                "group": "general"
            },
            {
                "key": "_requestType",
                "value": `Library Load (${libraryType})`,
                "hidden": true,
            }
        ];
    }
}
