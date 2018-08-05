/**
 * Ensighten Manage
 * https://www.ensighten.com/products/enterprise-tag-management/
 *
 * @class
 * @extends BaseProvider
 */
class EnsightenManageProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ENSIGHTENMANAGE";
        this._pattern    = /nexus\.ensighten\.com\/(?=.*Bootstrap\.js)/;
        this._name       = "Ensighten Manage";
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
            "account":      "omnibug_account"
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
        let matches =  url.pathname.match(/^\/([^/]+)\/(?:([^/]+)\/)?Bootstrap\.js/),
            results = [];
        /* istanbul ignore else */
        if(matches !== null) {
            matches[2] = matches[2] || "prod";
            results.push({
                "key":   "omnibug_account",
                "value": `${matches[1]} / ${matches[2]}`,
                "hidden": true
            });
            results.push({
                "key":   "client",
                "field": "Client",
                "value": matches[1],
                "group": "general"
            });
            results.push({
                "key":   "profile",
                "field": "Profile",
                "value": matches[2],
                "group": "general"
            });
        }

        return results;
    }
}