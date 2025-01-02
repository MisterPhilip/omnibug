/**
 * Merkle Merkury
 * https://cheq.ai/ensighten/enterprise-tag-management/
 *
 * @class
 * @extends BaseProvider
 */
class MerkleMerkuryProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "MERKLEMERKURY";
        this._pattern    = /\/tpTracking\/loader\/load\.js/;
        this._name       = "Merkle Merkury";
        this._type       = "visitorid";
        this._keywords   = [];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "sv_cid",
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
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "sv_cid": {
                "name": "Account ID",
                "group": "general"
            },
            "url": {
                "name": "Page URL",
                "group": "general"
            }
        };
    }
}
