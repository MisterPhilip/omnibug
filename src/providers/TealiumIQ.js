/**
 * Tealium IQ
 * https://tealium.com/products/tealium-iq-tag-management-system/
 *
 * @class
 * @extends BaseProvider
 */
class TealiumIQProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "TEALIUMIQ";
        this._pattern    = /tags\.tiqcdn\.com\/utag\/((?=.*utag\.js)|(?=.*utag\.sync\.js))/;
        this._name       = "Tealium IQ";
        this._type       = "tagmanager";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "omnibug_account",
            "requestType":  "requestType"
        }
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
    handleCustom(url, params)
    {
        let matches =  url.pathname.match(/^\/utag\/([^/]+)\/([^/]+)\/([^/]+)\/(utag(?:\.sync)?\.js)/),
            results = [];
        /* istanbul ignore else */
        if(matches !== null && matches.length === 5) {
            results.push({
                "key":   "omnibug_account",
                "value": `${matches[1]} / ${matches[2]}`,
                "hidden": true
            });
            results.push({
                "key":   "acccount",
                "field": "Account",
                "value": matches[1],
                "group": "general"
            });
            results.push({
                "key":   "profile",
                "field": "Profile",
                "value": matches[2],
                "group": "general"
            });
            results.push({
                "key":   "environment",
                "field": "Environment",
                "value": matches[3],
                "group": "general"
            });
            results.push({
                "key":   "requestType",
                "value": (matches[4] === "utag.js") ? "Async" : "Sync",
                "hidden": true
            });
        }

        return results;
    }
}