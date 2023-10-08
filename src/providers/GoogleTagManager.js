/**
 * Google Tag Manager
 * https://tagmanager.google.com/
 *
 * @class
 * @extends BaseProvider
 */
class GoogleTagManagerProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "GOOGLETAGMAN";
        this._pattern    = /googletagmanager\.com\/gtm\.js/;
        this._name       = "Google Tag Manager";
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
            "account":      "id",
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
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "id": {
                "name": "Account ID",
                "group": "general"
            },
            "l": {
                "name": "Data Layer Variable",
                "group": "general"
            }
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
    handleCustom(url, params)
    {
        return [{
            "key": "_requestType",
            "value": "Library Load",
            "hidden": true,
        }];
    }
}
