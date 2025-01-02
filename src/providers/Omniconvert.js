/**
 * Omniconvert
 * https://help.omniconvert.com/kba/installing-the-omniconvert-tracking-code-on-your-website/
 *
 * @class
 * @extends BaseProvider
 */
class OmniconvertProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "OMNICONVERT";
        this._pattern    = /\/mktzsave\/?\?/;
        this._name       = "Omniconvert";
        this._type       = "testing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "id_website",
            "requestType": "event"
        };
    }
}
