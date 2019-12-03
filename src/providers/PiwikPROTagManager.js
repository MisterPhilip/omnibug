/**
 * Piwik PRO
 * https://piwik.pro/tag-manager/
 *
 * @class
 * @extends BaseProvider
 */
class PiwikPROTagManagerProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "PIWIKPROTMS";
        this._pattern = /\.piwik\.pro\/containers\/[a-z0-9-]+\.js/;
        this._name = "Piwik PRO Tag Manager";
        this._type = "tagmanager";
        this._keywords = ["piwik", "matomo", "tms"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "container_id",
            "requestType": "requestType"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups() {
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
        let matches = url.pathname.match(/^\/containers\/([a-z0-9-]+)\.js/),
            id = (matches && matches[1]) ? matches[1] : /* istanbul ignore next: should never happen, but it's a simple string default */ "";

        return [
            {
                "key": "requestType",
                "value": "Load",
                "hidden": true
            }, {
                "key": "container_id",
                "field": "Container ID",
                "value": id,
                "group": "general"
            }
        ];
    }
}