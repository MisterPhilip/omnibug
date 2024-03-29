/**
 * Adobe Launch
 * https://launch.adobe.com/
 *
 * @class
 * @extends BaseProvider
 */
class AdobeLaunchProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBELAUNCH";
        this._pattern    = /assets\.adobedtm\.com(?:\/[^?#;]+)?\/launch-[^?#]+.js/;
        this._name       = "Adobe Launch";
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
        let matches =  url.pathname.match(/\/launch-[^.-]+(-[^.]+)(?:\.min)?\.js/),
            env = (matches && matches[1]) ? matches[1].replace("-", "") : "production",
            results = [];
        results.push({
            "key":   "environment",
            "field": "Launch Environment",
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
