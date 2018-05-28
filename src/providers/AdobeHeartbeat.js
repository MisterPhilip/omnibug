/**
 * Adobe Heartbeat
 * https://marketing.adobe.com/resources/help/en_US/sc/appmeasurement/hbvideo/
 *
 * @class
 * @extends BaseProvider
 */
class AdobeHeartbeatProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "ADOBEHEARTBEAT";
        this._pattern    = /\.hb\.omtrdc\.net\//;
        this._name       = "Adobe Heartbeat";
        this._type       = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "s:sc:rsid",
            "requestType":  "omnibug_requestType"
        }
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "s:asset:video_id": {
                "name": "Content ID",
                "group": "General"
            },
            "l:asset:length": {
                "name": "Video Length",
                "group": "General"
            },
            "s:stream:type": {
                "name": "Content Type",
                "group": "General"
            },
            "s:event:sid": {
                "name": "Video Session ID",
                "group": "General"
            },
            "s:sp:player_name": {
                "name": "Content Player Name",
                "group": "General"
            },
            "s:sp:channel": {
                "name": "Content Channel",
                "group": "General"
            },
            "s:asset:name": {
                "name": "Video Name",
                "group": "General"
            },
            "s:sp:sdk": {
                "name": "SDK Version",
                "group": "General"
            },
            "s:sp:hb_version": {
                "name": "VHL Version",
                "group": "General"
            },
            "s:meta:a.media.show": {
                "name": "Show",
                "group": "General"
            },
            "s:meta:a.media.format": {
                "name": "Stream Format",
                "group": "General"
            },
            "s:meta:a.media.season": {
                "name": "Season",
                "group": "General"
            },
            "s:meta:a.media.episode": {
                "name": "Episode",
                "group": "General"
            },
            "s:meta:a.media.asset": {
                "name": "Asset ID",
                "group": "General"
            },
            "s:meta:a.media.genre": {
                "name": "Genre",
                "group": "General"
            },
            "s:meta:a.media.airDate": {
                "name": "First Air Date",
                "group": "General"
            },
            "s:meta:a.media.digitalDate": {
                "name": "First Digital Date",
                "group": "General"
            },
            "s:meta:a.media.rating": {
                "name": "Content Rating",
                "group": "General"
            },
            "s:meta:a.media.originator": {
                "name": "Originator",
                "group": "General"
            },
            "s:meta:a.media.network": {
                "name": "Network",
                "group": "General"
            },
            "s:meta:a.media.type": {
                "name": "Show Type",
                "group": "General"
            },
            "s:meta:a.media.pass.mvpd": {
                "name": "MVPD",
                "group": "General"
            },
            "s:meta:a.media.pass.auth": {
                "name": "Authorized",
                "group": "General"
            },
            "s:meta:a.media.dayPart": {
                "name": "Day Part",
                "group": "General"
            },
            "s:meta:a.media.feed": {
                "name": "Video Feed Type",
                "group": "General"
            },
            "s:meta:a.media.adload": {
                "name": "Ad Load Type",
                "group": "General"
            },
            "s:event:type": {
                "name": "Event Type",
                "group": "General"
            },
            "omnibug_requestType": {
                "hidden": true
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
        let results = [],
            event = url.searchParams.get("s:event:type");
        results.push({
            "key":   "omnibug_requestType",
            "value": event.charAt(0).toUpperCase() + event.slice(1),
            "hidden": true
        });
        return results;
    }
}