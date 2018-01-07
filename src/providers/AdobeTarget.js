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
                "name": "Mbox Type"
            },
            "mboxCount": {
                "name": "Mbox Count"
            },
            "mboxId": {
                "name": "Mbox ID"
            },
            "mboxSession": {
                "name": "Mbox Session"
            },
            "mboxPC": {
                "name": "Mbox PC ID"
            },
            "mboxPage": {
                "name": "Mbox Page ID"
            },
            "clientCode": {
                "name": "Client Code"
            },
            "mboxHost": {
                "name": "Page Host"
            },
            "mboxURL": {
                "name": "Page URL"
            },
            "mboxReferrer": {
                "name": "Page Referrer"
            },
            "screenHeight": {
                "name": "Screen Height"
            },
            "screenWidth": {
                "name": "Screen Width"
            },
            "browserWidth": {
                "name": "Browser Width"
            },
            "browserHeight": {
                "name": "Browser Height"
            },
            "browserTimeOffset": {
                "name": "Browser Timezone Offset"
            },
            "colorDepth": {
                "name": "Browser Color Depth"
            },
            "mboxXDomain": {
                "name": "CrossDomain Enabled"
            },
            "mboxTime": {
                "name": "Timestamp"
            },
            "mboxVersion": {
                "name": "Library Version"
            }
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {string} url
     *
     * @returns {Array}
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