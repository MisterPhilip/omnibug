/**
 * Demandbase Engagement
 * https://www.demandbase.com/solutions/engagement/
 *
 * @class
 * @extends BaseProvider
 */
class DemandbaseEngagementProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "DEMANDBASEENGAGEMENT";
        this._pattern    = /api\.company-target\.com\/api\/v2\/ip\.json/;
        this._name       = "Demandbase Engagement";
        this._type       = "marketing";
        this._keywords   = ["ip lookup"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "key"
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
            "page": {
                "name": "Page URL",
                "group": "general"
            },
            "page_title": {
                "name": "Page Title",
                "group": "general"
            },
            "key": {
                "name": "Account ID",
                "group": "general"
            },
            "referrer": {
                "name": "Page Referrer",
                "group": "general"
            },
            "src": {
                "name": "Called From",
                "group": "other"
            },
        };
    }
}
