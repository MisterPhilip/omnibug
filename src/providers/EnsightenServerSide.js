/**
 * Ensighten Server Side
 * https://cheq.ai/ensighten/enterprise-tag-management/
 *
 * @class
 * @extends BaseProvider
 */
class EnsightenServerSideProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ENSIGHTENSST";
        this._pattern    = /\/sst\/?\?sstVersion=/;
        this._name       = "Ensighten Server Side";
        this._type       = "tagmanager";
        this._keywords   = ["tms", "cheq", "sst", "server side"];
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
                "key": "events",
                "name": "Events"
            },
            {
                "key": "dataLayer",
                "name": "Data Layer"
            }
        ];
    }

    /**
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "sstVersion": {
                "name": "Library Version",
                "group": "other"
            },
            "settings.nexusHost": {
                "name": "Library Hostname",
                "group": "other"
            },
            "settings.publishPath": {
                "name": "Library Publish Path",
                "group": "other"
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
        if(/^virtualBrowser\./.test(name)) {
            result = {
                "key":   name,
                "field": name.replace("virtualBrowser.", "Browser "),
                "value": value,
                "group": "other"
            };
        } else if(/^dataLayer\./.test(name)) {
            result = {
                "key":   name,
                "field": name.replace("dataLayer.", ""),
                "value": value,
                "group": "dataLayer"
            };
        } else if(/^events\[(\d+)]\.(.+)$/.test(name)) {
            const eventNumber = (parseInt(RegExp.$1) || 0) + 1;
            if(RegExp.$2 === "name") {
                result = {
                    "key":   name,
                    "field": `Event ${eventNumber} Name`,
                    "value": value,
                    "group": "events"
                };
            } else {
                result = {
                    "key":   name,
                    "field": `Event ${eventNumber} ${RegExp.$2.replace("data.", "")}`,
                    "value": value,
                    "group": "events"
                };
            }
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
        let matches =  url.pathname.match(/^\/pc\/([^/]+)\/sst/),
            results = [];
        /* istanbul ignore else */
        if(matches !== null) {
            results.push({
                "key":   "omnibug_account",
                "value": `${matches[1]}`,
                "hidden": true
            });
            results.push({
                "key":   "profile",
                "field": "Profile",
                "value": matches[1],
                "group": "general"
            });
        }

        return results;
    }
}
