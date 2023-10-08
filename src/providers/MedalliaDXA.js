/**
 * Medallia Digital Experience Analytics (f/k/a Decibel Insights)
 * https://www.medallia.com/products/digital-experience-analytics/
 * https://developer.medallia.com/medallia-dxa/docs/introduction

 *
 * @class
 * @extends BaseProvider
 */

class MedalliaDXAProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "MEDALLIADXA";
        this._pattern   = /\/i\/\d+\/\d+\/di\.js/;
        this._name      = "Medallia DXA";
        this._type      = "replay";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "_account",
            "requestType":  "requestTypeParsed"
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
                key: "general",
                name: "General"
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
        let results = [];

        // Account info
        const accountInfo =  url.pathname.match(/\/i\/(\d+)\/(\d+)\/di\.js/);
        if(accountInfo !== null) {
            results.push({
                "key":   "_account",
                "value": `${accountInfo[1]} / ${accountInfo[2]}`,
                "hidden": true,
            });
            results.push({
                "key":   "_accountID",
                "field": "Account ID",
                "value": accountInfo[1],
                "group": "general"
            });
            results.push({
                "key":   "_propertyID",
                "field": "Property ID",
                "value": accountInfo[2],
                "group": "general"
            });
        }

        results.push({
            "key":   "requestTypeParsed",
            "field": "Request Type",
            "value": "Library Load",
            "group": "general"
        });


        return results;
    } // handle custom
} // class
