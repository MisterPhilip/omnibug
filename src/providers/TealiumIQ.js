/**
 * Tealium iQ
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
        this._pattern    = /\/[^/]+\/[^/]+\/utag(\.sync)?\.js/;
        this._name       = "Tealium iQ";
        this._type       = "tagmanager";
        this._keywords   = ["tms"];
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
    handleCustom(url, params)
    {
        let matches =  url.pathname.match(/([^/]+)\/([^/]+)\/(utag(?:\.sync)?\.js)/),
            results = [],
            account = null;

        // When hosted on a first party domain, the account field does not exist
        if(/^\/utag\/([^/]+)\//.test(url.pathname)) {
            account = url.pathname.match(/^\/utag\/([^/]+)\//)[1];
        }

        if(matches !== null && matches.length === 4) {
            if(account) {
                results.push({
                    "key":   "omnibug_account",
                    "value": `${account} / ${matches[1]}`,
                    "hidden": true
                });
                results.push({
                    "key":   "acccount",
                    "field": "Account",
                    "value": account,
                    "group": "general"
                });
            } else {
                results.push({
                    "key":   "omnibug_account",
                    "value": matches[1],
                    "hidden": true
                });
            }

            results.push({
                "key":   "profile",
                "field": "Profile",
                "value": matches[1],
                "group": "general"
            });
            results.push({
                "key":   "environment",
                "field": "Environment",
                "value": matches[2],
                "group": "general"
            });
            results.push({
                "key":   "requestType",
                "value": ((matches[3] === "utag.js") ? "Async" : "Sync") + " Library Load",
                "hidden": true
            });
        }

        return results;
    }
}
