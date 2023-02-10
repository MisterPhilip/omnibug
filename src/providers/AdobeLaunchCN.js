/**
 * Adobe Launch CN
 * https://launch.adobe.com/
 *
 * @class
 * @extends BaseProvider
 */
class AdobeLaunchCNProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBELAUNCH_CN";
        this._pattern    = /assets\.adoberesources\.cn(?:\/[^?#;]+)?\/launch-[^?#]+.js/;
        this._name       = "Adobe Launch China Node";
        this._type       = "tagmanager";
        this._keywords   = ["activate", "activation", "tms"];
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
        let matches =  url.pathname.match(/\/launch-[^.-]+(-[^.]+)(?:\.min)?\.js/),
            env = (matches && matches[1]) ? matches[1].replace("-", "") : "production",
            results = [];
        results.push({
            "key":   "environment",
            "field": "Launch Environment",
            "value": env,
            "group": "general"
        });

        return results;
    }
}
