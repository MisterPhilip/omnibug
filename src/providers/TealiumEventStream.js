/**
 * Tealium EventStream
 * https://tealium.com/products/tealium-eventstream/
 *
 * @class
 * @extends BaseProvider
 */
class TealiumEventStreamProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "TEALIUMEVENTSTREAM";
        this._pattern    = /collect\.tealiumiq\.com\/event/;
        this._name       = "Tealium EventStream";
        this._type       = "tagmanager";
        this._keywords   = ["tms", "server"];
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
            "requestType":  "tealium_event"
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
            },
            {
                "key": "browser",
                "name": "Browser Data"
            },
            {
                "key": "dom",
                "name": "DOM Data"
            },
            {
                "key": "js_var",
                "name": "JavaScript UDO Variables"
            },
            {
                "key": "meta",
                "name": "Meta Data"
            },
            {
                "key": "mouse",
                "name": "Mouse Data"
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
            "tealium_event": {
                "name": "Event Name",
                "group": "general"
            },
            "tealium_environment": {
                "name": "Environment",
                "group": "general"
            },
            "tealium_profile": {
                "name": "Profile",
                "group": "general"
            },
            "tealium_account": {
                "name": "Account ID",
                "group": "general"
            },
            "tealium_datasource": {
                "name": "Data Source",
                "group": "general"
            },
            "tealium_visitor_id": {
                "name": "Visitor ID",
                "group": "general"
            },
            "tealium_session_id": {
                "name": "Session ID",
                "group": "general"
            },
            "tealium_session_number": {
                "name": "Session Number",
                "group": "general"
            },
            "tealium_library_name": {
                "name": "Library Name",
                "group": "general"
            },
            "tealium_library_version": {
                "name": "Library Version",
                "group": "general"
            },
        };
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     *
     * @returns {void|{}}
     */
    handleQueryParam(name, value) {

        let result = {};
        if(/^browser\.(.+)$/.test(name)) {
            result = {
                "key": name,
                "field": RegExp.$1,
                "value": value,
                "group": "browser"
            };
        } else if(/^dom\.(.+)$/.test(name)) {
            result = {
                "key": name,
                "field": RegExp.$1,
                "value": value,
                "group": "dom"
            };
        } else if(/^js_page\.(.+)$/.test(name)) {
            result = {
                "key": name,
                "field": RegExp.$1,
                "value": value,
                "group": "js_page"
            };
        } else if(/^meta\.(.+)$/.test(name)) {
            result = {
                "key": name,
                "field": RegExp.$1,
                "value": value,
                "group": "meta"
            };
        } else if(/^_mouse_(.+)$/.test(name)) {
            result = {
                "key": name,
                "field": RegExp.$1,
                "value": value,
                "group": "mouse"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
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
        return [
            {
                "key":   "omnibug_hostname",
                "field": "Hostname",
                "value": url.hostname,
                "group": "general"
            },
            {
                "key":   "omnibug_account",
                "value": `${params.get("tealium_account")} / ${params.get("tealium_profile")}`,
                "hidden": true
            },
        ];
    }
}
