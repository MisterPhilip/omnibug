/**
 * Adform
 * https://about.ads.microsoft.com/en-us/solutions/audience-targeting/universal-event-tracking
 *
 * @class
 * @extends BaseProvider
 */
class AdformProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "ADFORM";
        this._pattern = /track\.adform\.net\/Serving\/TrackPoint/;
        this._name = "Adform";
        this._type = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "pm"
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
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "pm": {
                "name": "Tracking ID",
                "group": "general"
            }
        };
    }
}
