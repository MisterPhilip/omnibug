/**
 * Adobe Dynamic Tag Manager (DTM)
 * https://dtm.adobe.com/
 *
 * @class
 * @extends BaseProvider
 */
class AdobeDynamicTagManagerProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEDTM";
        this._pattern    = /\/satelliteLib-[^.]+\.js/;
        this._name       = "Adobe Dynamic Tag Manager";
        this._type       = "tagmanager";
        this._keywords   = ["dtm", "activate", "activation", "tms"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "environment",
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
    handleCustom(url, params)
    {
        let matches =  url.pathname.match(/\/satelliteLib-[^.-]+(-staging)?\.js/),
            env = (matches && matches[1]) ? matches[1].replace("-", "") : "production",
            results = [];
        results.push({
            "key":   "environment",
            "field": "DTM Environment",
            "value": env,
            "group": "general"
        });
        results.push({
            "key": "_requestType",
            "value": "Library Load",
            "hidden": true,
        });
        return results;
    }
}
