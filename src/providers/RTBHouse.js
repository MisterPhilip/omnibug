/**
 * RTB House
 * https://www.rtbhouse.com/our-products/personalized-retargeting/
 *
 * @class
 * @extends BaseProvider
 */

class RTBHouseProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "RTBHOUSE";
        this._pattern   = /creativecdn\.com\/tags\/?\?/;
        this._name      = "RTB House";
        this._type      = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "id"
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
            "id" : {
                "name": "Pixel ID",
                "group": "general"
            },
        };
    }
}
