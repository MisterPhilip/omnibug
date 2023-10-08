/**
 * Amazon Ad Tag
 * (No real dev docs)
 * 
 * @class
 * @extends BaseProvider
 */
class AmazonAdTagProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "AMAZONADTAG";
        this._pattern = /amazon-adsystem\.com\/iu3/;
        this._name = "Amazon Ad Tag";
        this._type = "marketing";
        this._keywords = ["AAT"];
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
            "account":     "pid",
            "requestType": "event",
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
            "event": {
                "name": "Event Name",
                "group": "general"
            },
            "pid": {
                "name": "Pixel ID",
                "group": "general"
            },
            "ts": {
                "name": "Timestamp",
                "group": "general"
            },
        };
    }
}
