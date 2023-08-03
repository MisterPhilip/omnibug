/**
 * RudderStack
 * https://www.rudderstack.com/
 *
 * @class
 * @extends BaseProvider
 */
class RudderStackProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "RUDDERSTACK";
        this._pattern    = /rudderstack\.com\/v1\//;
        this._name       = "RudderStack";
        this._type       = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "requestType":  "omnibug_requestType"
        };
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {

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
    handleCustom(url, params)
    {
        let results = [],
            action = url.pathname.match(/\/v1\/([^/]+)$/);
        if(action) {
            let type = action[1].toLowerCase();
            if(type === "p" || type === "page") {
                type = "Page";
            } else if(type === "i" || type === "identify") {
                type = "Identify";
            } else if(type === "t" || type === "track") {
                type = "Track";
            } else if(type === "s" || type === "screen") {
                type = "Screen";
            } else if(type === "g" || type === "group") {
                type = "Group";
            } else if(type === "a" || type === "alias") {
                type = "Alias";
            } else if(type === "b" || type === "batch") {
                type = "Batch";
            }

            results.push({
                "key":   "omnibug_requestType",
                "value": type,
                "hidden": true
            });
        }
        return results;
    }
}
