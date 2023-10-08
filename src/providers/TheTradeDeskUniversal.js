/**
 * The Trade Desk - Universal Pixel
 * https://partner.thetradedesk.com/v3/portal/data/doc/TrackingTagsUniversalPixel
 * 
 * @class
 * @extends BaseProvider
 */
class TheTradeDeskUniversalProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "TDDUNIVERSAL";
        this._pattern = /insight\.adsrvr\.org\/track\/up/;
        this._name = "The Trade Desk";
        this._type = "marketing";
        this._keywords = ["TDD"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     * The account is unique to each TikTok pixel event, meaning multiple events firing from the same pixel SDK will have discreet identifiers
     * 
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "_account"
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
                "key": "conversion",
                "name": "Conversion"
            },
            {
                "key": "dynamic",
                "name": "Dynamic Parameters"
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
            "adv": {
                "name": "Advertiser ID",
                "group": "general"
            },
            "upid": {
                "name": "Universal Pixel ID",
                "group": "general"
            },
            "v": {
                "name": "Revenue",
                "group": "conversion"
            },
            "vf": {
                "name": "Currency Code",
                "group": "conversion"
            },
            "orderid": {
                "name": "Order ID",
                "group": "conversion"
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
    handleQueryParam(name, value)
    {
        if(/^td\d+$/i.test(name)) {
            return {
                "key":   name,
                "field": name,
                "value": value,
                "group": "dynamic"
            };
        }
        return super.handleQueryParam(name, value);
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

        results.push({
            "key":   "_account",
            "value": `${params.get("adv")} / ${params.get("upid")}`,
            "hidden": true
        });


        return results;
    } // handle custom
}
