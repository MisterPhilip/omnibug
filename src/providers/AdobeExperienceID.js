/**
 * Adobe Experience ID Service
 * http://www.adobe.com/data-analytics-cloud/audience-manager.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeExperienceIDProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEEXPERIENCEID";
        this._pattern    = /\/id\?(?=.*d_visid_ver=)(?=.*(d_orgid|mcorgid)=)/;
        this._name       = "Adobe Experience Cloud ID";
        this._type       = "visitorid";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "requestType": "omnibug_requestType",
            "account": "omnibug_account"
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
    get keys()
    {
        return {
            "d_orgid": {
                "name": "Adobe Organization ID",
                "group": "general"
            },
            "d_rtbd": {
                "name": "Return Method",
                "group": "general"
            },
            "d_cb": {
                "name": "Callback property",
                "group": "general"
            },
            "mcorgid": {
                "name": "Adobe Organization ID",
                "group": "general"
            },
            "d_visid_ver": {
                "name": "Experience Cloud ID Version",
                "group": "general"
            },
            "d_cid_ic": {
                "name": "Integration Code / User ID",
                "group": "general"
            },
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     * @param    {object}   params
     *
     * @returns {Array}
     */
    handleCustom(url, params)
    {
        let results = [],
            accountID = "";
        if(params.get("d_orgid")) {
            accountID = params.get("d_orgid");
        } else if(params.get("mcorgid")) {
            accountID = params.get("mcorgid");
        }
        results.push({
            "key":   "omnibug_account",
            "value": accountID,
            "hidden": true
        });
        return results;
    }
}