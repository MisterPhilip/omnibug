/**
 * Adobe Target
 * http://www.adobe.com/marketing-cloud/target.html
 *
 * @class
 * @extends BaseProvider
 */
class AdobeTargetProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBETARGET";
        this._pattern    = /\.tt\.omtrdc\.net\//;
        this._name       = "Adobe Target";
        this._type       = "testing";
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "mbox": {
                "name": "Mbox Name",
                "group": "General"
            },
            "mboxType": {
                "name": "Mbox Type",
                "group": "General"
            },
            "mboxCount": {
                "name": "Mbox Count",
                "group": "General"
            },
            "mboxId": {
                "name": "Mbox ID",
                "group": "General"
            },
            "mboxSession": {
                "name": "Mbox Session",
                "group": "General"
            },
            "mboxPC": {
                "name": "Mbox PC ID",
                "group": "General"
            },
            "mboxPage": {
                "name": "Mbox Page ID",
                "group": "General"
            },
            "clientCode": {
                "name": "Client Code",
                "group": "General"
            },
            "mboxHost": {
                "name": "Page Host",
                "group": "General"
            },
            "mboxURL": {
                "name": "Page URL",
                "group": "General"
            },
            "mboxReferrer": {
                "name": "Page Referrer",
                "group": "General"
            },
            "screenHeight": {
                "name": "Screen Height",
                "group": "General"
            },
            "screenWidth": {
                "name": "Screen Width",
                "group": "General"
            },
            "browserWidth": {
                "name": "Browser Width",
                "group": "General"
            },
            "browserHeight": {
                "name": "Browser Height",
                "group": "General"
            },
            "browserTimeOffset": {
                "name": "Browser Timezone Offset",
                "group": "General"
            },
            "colorDepth": {
                "name": "Browser Color Depth",
                "group": "General"
            },
            "mboxXDomain": {
                "name": "CrossDomain Enabled",
                "group": "General"
            },
            "mboxTime": {
                "name": "Timestamp",
                "group": "General"
            },
            "mboxVersion": {
                "name": "Library Version",
                "group": "General"
            }
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {URL} url
     *
     * @returns {void|Array}
     */
    handleCustom(url)
    {
        let matches =  url.pathname.match( /\/([^\/]+)\/mbox\/([^\/?]+)/ ),
            results = [];
        if(matches !== null && matches.length === 3) {
            results.push({
                "key":   "clientCode",
                "field": "Client Code",
                "value": matches[1],
                "group": "General"
            });
            results.push({
                "key":   "mboxType",
                "field": "Mbox Type",
                "value": matches[2],
                "group": "General"
            });
        }
        return results;
    }
}
OmnibugProvider.addProvider(new AdobeTargetProvider());