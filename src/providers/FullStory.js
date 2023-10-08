/**
 * Full Story
 * https://www.fullstory.com/
 * https://developer.fullstory.com/browser/getting-started/

 *
 * @class
 * @extends BaseProvider
 */

class FullStoryProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "FULLSTORY";
        this._pattern   = /edge\.fullstory\.com\/s\/fs\.js/;
        this._name      = "FullStory";
        this._type      = "replay";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "requestType":  "requestTypeParsed"
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {string}   url
     * @param    {object}   params
     *
     * @returns {void|Array}
     */
    handleCustom(url, params)
    {
        return [{
            "key":   "requestTypeParsed",
            "value": "Library Load",
            "hidden": true,
        }];
    }
}
