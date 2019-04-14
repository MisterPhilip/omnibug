/**
 * AT Internet
 * https://www.atinternet.com/
 *
 * @class
 * @extends BaseProvider
 */
class ATInternetProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ATINTERNET";
        this._pattern    = /^([^#?]+)(\/hit\.xiti)/;
        this._name       = "AT Internet";
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
            "account":      "s",
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
            },
            {
                "key": "content",
                "name": "Content Variables"
            },
            {
                "key": "custom",
                "name": "Custom Variables"
            },
            {
                "key": "media",
                "name": "Media Variables"
            },
            {
                "key": "click",
                "name": "Click Variables"
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
            "col": {
                "name": "Protocol Version",
                "group": "general"
            },
            "vtag": {
                "name": "Library Version",
                "group": "general"
            },
            "ptag": {
                "name": "Tag Type",
                "group": "general"
            },
            "r": {
                "name": "Screen Info",
                "group": "general"
            },
            "re": {
                "name": "Window Resolution",
                "group": "general"
            },
            "ref": {
                "name": "Referrer",
                "group": "general"
            },
            "lng": {
                "name": "Language",
                "group": "general"
            },
            "ts": {
                "name": "Timestamp",
                "group": "general"
            },
            "from": {
                "name": "Method of Hit Generation",
                "group": "general"
            },
            "s": {
                "name": "Site Number",
                "group": "general"
            },
            "idclient": {
                "name": "Unique Visitor ID",
                "group": "general"
            },
            "an": {
                "name": "Visitor Numerical ID",
                "group": "general"
            },
            "at": {
                "name": "Visitor Textual ID",
                "group": "general"
            },
            "ac": {
                "name": "Visitor Category ID",
                "group": "general"
            },
            "dg": {
                "name": "Display Size Type",
                "group": "general"
            },
            "p": {
                "name": "Content",
                "group": "content"
            },
            "s2": {
                "name": "Level 2",
                "group": "content"
            },
            "click": {
                "name": "Click Type",
                "group": "click"
            },
            "pclick": {
                "name": "Clicked Page Name",
                "group": "click"
            },
            "s2click": {
                "name": "Clicked Level 2",
                "group": "click"
            },
            "mc": {
                "name": "Search Keyword",
                "group": "content"
            },
            "np": {
                "name": "Search Results Count",
                "group": "content"
            },
            "mcrg": {
                "name": "Search Results Position Clicked",
                "group": "click"
            },
            "ptype": {
                "name": "Custom Tree",
                "group": "general"
            },
            "aisl": {
                "name": "Aisles",
                "group": "general"
            },
            "action": {
                "name": "Action",
                "group": "media"
            },
            "type": {
                "name": "Media Type",
                "group": "media"
            },
            "m6": {
                "name": "Broadcast Type",
                "group": "media"
            },
            "m1": {
                "name": "Content Duration",
                "group": "media"
            },
            "m5": {
                "name": "Broadcast Location",
                "group": "media"
            },
            "buf": {
                "name": "Buffering",
                "group": "media"
            },
            "prich": {
                "name": "Page",
                "group": "media"
            },
            "s2rich": {
                "name": "Page Level 2",
                "group": "media"
            },
            "plyr": {
                "name": "Player ID",
                "group": "media"
            },
            "clnk": {
                "name": "Linked Content",
                "group": "media"
            },
            "m9": {
                "name": "Broadcast Domain",
                "group": "media"
            }
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
    handleQueryParam(name, value)
    {
        let result = {};
        if(/^x(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Site " + RegExp.$1,
                "value": value,
                "group": "custom"
            };
        } else if(/^f(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Page " + RegExp.$1,
                "value": value,
                "group": "custom"
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
     * @returns {Array}
     */
    handleCustom(url, params)
    {
        let results = [],
            type = params.get("type"),
            requestType = type || "Page View";

        results.push({
            "key":   "trackingServer",
            "field": "Tracking Server",
            "value": url.hostname,
            "group": "general",
        });
        results.push({
            "key":   "requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }
}