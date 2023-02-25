/**
 * Teads Universal Pixel
 * 
 * @class
 * @extends BaseProvider
 */
class TeadsProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "TEADS";
        this._pattern = /https:\/\/t\.teads\.tv\/track(?:.*[&#?]tag_version=)/;
        this._name = "Teads";
        this._type = "marketing";
        this._keywords = ["Teads"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     * 
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "buyer_pixel_id",
            "requestType": "action"
        };
    }

    /**
     * Retrieve the group names & order
     *
     * @returns {*[]}
     */
    get groups()
    {
        return [];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {};
    }
}
