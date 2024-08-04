/**
 * Seznam Sklik
 * https://napoveda.sklik.cz/merici-skripty/
 * https://napoveda.sklik.cz/en/tracking-scripts/
 *
 * @class
 * @extends BaseProvider
 */
class SeznamSklikProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "SEZNAMSKLIK";
        this._pattern    = /c\.seznam\.cz\/(retargeting|conv)\?.+/;
        this._name       = "Seznam Sklik";
        this._type       = "marketing";
        this._keywords   = ["retargeting", "seznam", "seznam.cz", "rc.js", "sklik"];
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
            },
            {
                "key": "identities",
                "name": "Identities"
            },
            {
                "key": "zbozi.cz",
                "name": "Zbozi.cz"
            }            
        ];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "id": {
                "group": "general"
            },
            "url": {
                "group": "general"
            },
            "consent": {
                "group": "general"
            },
            "value": {
                "group": "general"
            },
            "category": {
                "group": "general"
            },
            "itemId": {
                "group": "general"
            },
            "pageType": {
                "group": "general"
            },
            "ids": {
                "group": "identities"
            },
            "ids.eid": {
                "group": "identities"
            },            
            "orderId": {
                "group": "zbozi.cz"
            },
            "zboziType": {
                "group": "zbozi.cz"
            },
            "zboziId": {
                "group": "zbozi.cz"
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
        let matchesRetargeting = /c\.seznam\.cz\/retargeting.+/.test(url),
            matchesConversion = /c\.seznam\.cz\/conv.+/.test(url),
            results = [];

        results.push({
            "key": "_requestType",
            "value": matchesRetargeting ? "Retargeting" : "Conversion",
            "hidden": true,
        });
        return results;
    }
}