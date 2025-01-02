/**
 * Indicative
 * https://docs.mparticle.com/guides/analytics-deprecated/developer-docs/sdks/javascript/
 *
 * @class
 * @extends BaseProvider
 */

class IndicativeProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "INDICATIVE";
        this._pattern   = /api\.indicative.com\/service\/event/;
        this._name      = "Indicative";
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
            "account":      "apiKey",
            "requestType":  "eventName"
        };
    }
} // class
