/**
 * Adobe Analytics
 * http://www.adobe.com/data-analytics-cloud/analytics.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeAudienceManagerProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEAUDIENCEMANAGER";
        this._pattern    = /demdex\.net\//;
        this._name       = "Adobe Audience Manager";
        this._type       = "visitorid";
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
                "group": "General"
            },
            "d_rtbd": {
                "name": "Return Method",
                "group": "General"
            },
            "d_cb": {
                "name": "Callback property",
                "group": "General"
            }
        };
    }
}
OmnibugProvider.addProvider(new AdobeAnalyticsProvider());