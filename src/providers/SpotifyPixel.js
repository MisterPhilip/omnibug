/**
 * Spotify Pixel
 * https://help.adanalytics.spotify.com/technical-pixel-docs
 *
 * @class
 * @extends BaseProvider
 */
class SpotifyPixelProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "SPOTIFYPIXEL";
        this._pattern    = /pixels\.spotify\.com\/v1\/ingest/;
        this._name       = "Spotify Pixel";
        this._type       = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "pid",
            "requestType":  "omnibug_requestType"
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
            {
                "key": "events",
                "name": "Events"
            },
        ];
    }

    /**
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "pid": {
                "name": "Pixel ID",
                "group": "general"
            },
        };
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     *
     * @returns {void|{}}
     */
    handleQueryParam(name, value) {

        let result = {};
        if(/^events\[(\d+)]\.(.+)$/.test(name)) {
            const eventNumber = (parseInt(RegExp.$1) || 0) + 1;
            result = {
                "key": name,
                "field": `Event ${eventNumber} ${RegExp.$2}`,
                "value": value,
                "group": "events"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array|Object}
     */
    parsePostData(postData = "")
    {
        if(typeof postData === "string" && postData)
        {
            try
            {
                let parsed = JSON.parse(postData);
                // Remove the batch parameters if there is only one hit
                if(parsed && Array.isArray(parsed.batch) && parsed.batch.length === 1) {
                    postData = JSON.stringify(parsed.batch[0]);
                }
            }
            catch(e)
            {
                console.error("postData is not JSON", e.message);
            }
        }
        return super.parsePostData(postData);
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
        let results = [],
            requestType = "";

        const types = Array.from(params.entries())
            .filter(([key, ]) => {
                return /events\[\d+]\.action$/.test(key);
            }).map(([, hitType]) => {
                return hitType.toLowerCase();
            });

        if(types.length > 1) {
            requestType = `(${types.length}) ${types.join(", ")}`;
        } else if(types.length === 1) {
            requestType = types.pop();
        } else {
            requestType = "Other";
        }
        results.push({
            "key":    "omnibug_requestType",
            "value":  requestType,
            "hidden": true
        });
        return results;
    }
}
