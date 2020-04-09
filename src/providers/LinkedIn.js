/**
 * LinkedIn Conversions
 * https://business.linkedin.com/marketing-solutions/insight-tag
 *
 * @class
 * @extends BaseProvider
 */
class LinkedInProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "LINKEDINPIXEL";
        this._pattern = /px\.ads\.linkedin\.com\/collect/;
        this._name = "LinkedIn Conversion";
        this._type = "marketing";
        this._keywords = ["li", "linkedin", "insight", "licdn"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "pid",
            "requestType": "requestType"
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
            "pid": {
                "name": "Pixel ID",
                "group": "general"
            },
            "conversionId": {
                "name": "Conversion ID",
                "group": "other"
            },
            "time": {
                "name": "Timestamp",
                "group": "other"
            },
            "fmt": {
                "name": "Pixel Type",
                "group": "other"
            },
            "url": {
                "name": "Page URL",
                "group": "other"
            }
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
    handleCustom(url, params) {
        let results = [],
            requestType = "Conversion";

        // @TODO: More pixel types are sent, but no public documentation for this :(
        results.push({
            "key": "requestType",
            "value": requestType,
            "field": "Request Type",
            "group": "general"
        });

        return results;
    }
}