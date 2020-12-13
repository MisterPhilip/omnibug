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
        this._pattern    = /\.hb\.omtrdc\.net\/|\/api\/v1\/sessions/;
        this._name       = "Adobe Heartbeat";
        this._type       = "analytics";
        this._keywords   = ["video"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "omnibug_account",
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
                "key": "customMetadata",
                "name": "Custom Meta Data"
            },
            {
                "key": "analytics",
                "name": "Analytics"
            },
            {
                "key": "visitorID",
                "name": "Visitor ID"
            },
            {
                "key": "media",
                "name": "Media Content"
            },
            {
                "key": "ads",
                "name": "Media Ads"
            },
            {
                "key": "player",
                "name": "Player"
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
            "s:asset:video_id": {
                "name": "Content ID",
                "group": "general"
            },
            "l:asset:length": {
                "name": "Video Length",
                "group": "general"
            },
            "s:stream:type": {
                "name": "Content Type",
                "group": "general"
            },
            "s:event:sid": {
                "name": "Video Session ID",
                "group": "general"
            },
            "s:sp:player_name": {
                "name": "Content Player Name",
                "group": "general"
            },
            "s:sp:channel": {
                "name": "Content Channel",
                "group": "general"
            },
            "s:asset:name": {
                "name": "Video Name",
                "group": "general"
            },
            "s:sp:sdk": {
                "name": "SDK Version",
                "group": "general"
            },
            "s:sp:hb_version": {
                "name": "VHL Version",
                "group": "general"
            },
            "s:meta:a.media.show": {
                "name": "Show",
                "group": "general"
            },
            "s:meta:a.media.format": {
                "name": "Stream Format",
                "group": "general"
            },
            "s:meta:a.media.season": {
                "name": "Season",
                "group": "general"
            },
            "s:meta:a.media.episode": {
                "name": "Episode",
                "group": "general"
            },
            "s:meta:a.media.asset": {
                "name": "Asset ID",
                "group": "general"
            },
            "s:meta:a.media.genre": {
                "name": "Genre",
                "group": "general"
            },
            "s:meta:a.media.airDate": {
                "name": "First Air Date",
                "group": "general"
            },
            "s:meta:a.media.digitalDate": {
                "name": "First Digital Date",
                "group": "general"
            },
            "s:meta:a.media.rating": {
                "name": "Content Rating",
                "group": "general"
            },
            "s:meta:a.media.originator": {
                "name": "Originator",
                "group": "general"
            },
            "s:meta:a.media.network": {
                "name": "Network",
                "group": "general"
            },
            "s:meta:a.media.type": {
                "name": "Show Type",
                "group": "general"
            },
            "s:meta:a.media.pass.mvpd": {
                "name": "MVPD",
                "group": "general"
            },
            "s:meta:a.media.pass.auth": {
                "name": "Authorized",
                "group": "general"
            },
            "s:meta:a.media.dayPart": {
                "name": "Day Part",
                "group": "general"
            },
            "s:meta:a.media.feed": {
                "name": "Video Feed Type",
                "group": "general"
            },
            "s:meta:a.media.adload": {
                "name": "Ad Load Type",
                "group": "general"
            },
            "s:event:type": {
                "name": "Event Type",
                "group": "general"
            },
            "params.analytics.trackingServer": {
                "name": "Tracking Server",
                "group": "analytics"
            },
            "params.analytics.reportSuite": {
                "name": "Report Suite",
                "group": "analytics"
            },
            "params.analytics.enableSSL": {
                "name": "Enable SSL",
                "group": "analytics"
            },
            "params.analytics.visitorId": {
                "name": "Analytics Visitor ID",
                "group": "visitorID"
            },
            "params.visitor.marketingCloudOrgId": {
                "name": "Experience Cloud Org ID",
                "group": "visitorID"
            },
            "params.visitor.marketingCloudUserId": {
                "name": "Experience Cloud User ID",
                "group": "visitorID"
            },
            "params.visitor.aamLocationHint": {
                "name": "Adobe Audience Manager Edge Data",
                "group": "visitorID"
            },
            "params.appInstallationId": {
                "name": "App/Device ID",
                "group": "visitorID"
            },
            "params.analytics.optOutServerSideForwarding	": {
                "name": "Analytics Server-Side Opt Out",
                "group": "visitorID"
            },
            "params.analytics.optOutShare	": {
                "name": "Analytics Federated Opt Out",
                "group": "visitorID"
            },
            "params.media.state.name": {
                "name": "Media State",
                "group": "media"
            },
            "params.media.id": {
                "name": "Content ID",
                "group": "media"
            },
            "params.media.name": {
                "name": "Content Name",
                "group": "media"
            },
            "params.media.length": {
                "name": "Content Length",
                "group": "media"
            },
            "params.media.contentType": {
                "name": "Content Format",
                "group": "media"
            },
            "params.media.streamType": {
                "name": "Stream Type",
                "group": "media"
            },
            "params.media.playerName": {
                "name": "Player Name",
                "group": "player"
            },
            "params.media.channel": {
                "name": "Content Channel",
                "group": "media"
            },
            "params.media.resume": {
                "name": "Session Resume",
                "group": "media"
            },
            "params.media.sdkVersion": {
                "name": "SDK Name",
                "group": "general"
            },
            "params.media.libraryVersion": {
                "name": "SDK Version",
                "group": "general"
            },
            "params.media.show": {
                "name": "Show / Series Name",
                "group": "media"
            },
            "params.media.season": {
                "name": "Season Number",
                "group": "media"
            },
            "params.media.episode": {
                "name": "Episode Number",
                "group": "media"
            },
            "params.media.assetId": {
                "name": "Asset ID",
                "group": "media"
            },
            "params.media.genre": {
                "name": "Genre",
                "group": "media"
            },
            "params.media.firstAirDate": {
                "name": "First Air Date",
                "group": "media"
            },
            "params.media.firstDigitalDate": {
                "name": "First Digital Date",
                "group": "media"
            },
            "params.media.rating": {
                "name": "Rating",
                "group": "media"
            },
            "params.media.originator": {
                "name": "Originator",
                "group": "media"
            },
            "params.media.network": {
                "name": "Network",
                "group": "media"
            },
            "params.media.showType": {
                "name": "Content Type",
                "group": "media"
            },
            "params.media.adLoad": {
                "name": "Ad Type",
                "group": "ads"
            },
            "params.media.pass.mvpd": {
                "name": "MVPD",
                "group": "media"
            },
            "params.media.pass.auth": {
                "name": "Adobe Auth",
                "group": "media"
            },
            "params.media.dayPart": {
                "name": "Timeparting",
                "group": "media"
            },
            "params.media.feed": {
                "name": "Feed Type",
                "group": "media"
            },
            "params.media.ad.podFriendlyName": {
                "name": "Ad Break Name",
                "group": "ads"
            },
            "params.media.ad.podIndex": {
                "name": "Ad Break Index",
                "group": "ads"
            },
            "params.media.ad.podSecond": {
                "name": "Ad Break Start Time",
                "group": "ads"
            },
            "params.media.ad.podPosition": {
                "name": "Ad Break Position",
                "group": "ads"
            },
            "params.media.ad.name": {
                "name": "Ad Name",
                "group": "ads"
            },
            "params.media.ad.id": {
                "name": "Ad ID",
                "group": "ads"
            },
            "params.media.ad.length": {
                "name": "Ad Length",
                "group": "ads"
            },
            "params.media.ad.playerName": {
                "name": "Ad Player Name",
                "group": "ads"
            },
            "params.media.ad.advertiser": {
                "name": "Advertiser",
                "group": "ads"
            },
            "params.media.ad.campaignId": {
                "name": "Ad Campaign ID",
                "group": "ads"
            },
            "params.media.ad.creativeId": {
                "name": "Ad Creative ID",
                "group": "ads"
            },
            "params.media.ad.siteId": {
                "name": "Ad Site ID",
                "group": "ads"
            },
            "params.media.ad.creativeURL": {
                "name": "Ad Creative URL",
                "group": "ads"
            },
            "params.media.ad.placementId": {
                "name": "Ad Placement ID",
                "group": "ads"
            },
            "params.media.chapter.index": {
                "name": "Chapter Index",
                "group": "media"
            },
            "params.media.chapter.offset": {
                "name": "Chapter Time Start",
                "group": "media"
            },
            "params.media.chapter.length": {
                "name": "Chapter Length",
                "group": "media"
            },
            "params.media.chapter.friendlyName": {
                "name": "Chapter Name",
                "group": "media"
            },
            "qoeData.media.qoe.bitrate": {
                "name": "Player Bitrate",
                "group": "player"
            },
            "qoeData.media.qoe.droppedFrames": {
                "name": "Dropped Frames",
                "group": "player"
            },
            "qoeData.media.qoe.framesPerSecond": {
                "name": "Frames Per Second",
                "group": "player"
            },
            "qoeData.media.qoe.timeToStart": {
                "name": "Time to Start",
                "group": "player"
            },
            "eventType": {
                "name": "Event Type",
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
    handleQueryParam(name, value)
    {
        let result = {};
        if(/^customMetadata\./i.test(name)) {
            result = {
                "key":   name,
                "field": "prop" + RegExp.$1,
                "value": value,
                "group": "props"
            };
        } else if(/^params\.analytics\./i.test(name) && !(name in this.keys)) {
            result = {
                "key":   name,
                "field": name.replace(/^params\.analytics\./i, ""),
                "value": value,
                "group": "analytics"
            };
        } else if(/^params\.visitor\./i.test(name) && !(name in this.keys)) {
            result = {
                "key":   name,
                "field": name.replace(/^params\.visitor\./i, ""),
                "value": value,
                "group": "visitorID"
            };
        } else if(/^params\.media\.ad\./i.test(name) && !(name in this.keys)) {
            result = {
                "key":   name,
                "field": name.replace(/^params\.media\.ad\./i, ""),
                "value": value,
                "group": "ads"
            };
        } else if(/^params\.media\./i.test(name) && !(name in this.keys)) {
            result = {
                "key":   name,
                "field": name.replace(/^params\.media\./i, ""),
                "value": value,
                "group": "media"
            };
        } else if(/^(playerTime|media\.player)?\./i.test(name) && !(name in this.keys)) {
            result = {
                "key":   name,
                "field": name.replace(/^(playerTime|media\.player)\./i, ""),
                "value": value,
                "group": "player"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
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
        let results = [], event = "", account = "";

        if(/\/api\/v1\/sessions\/?(([^/?#]+))?/.test(url)) {
            // Media SDK v3
            event = params.get("eventType") || "";
            account = params.get("params.analytics.reportSuite");
            if(RegExp.$1) {
                results.push({
                    "key":   "omnibug_sessionID",
                    "field": "Media Session ID",
                    "value": RegExp.$1,
                    "group": "general"
                });
            }
        } else {
            // Media SDK v1/v2
            event = params.get("s:event:type");
            account = params.get("s:sc:rsid");
        }

        results.push({
            "key":   "omnibug_account",
            "value": account,
            "hidden": true
        });
        results.push({
            "key":   "omnibug_requestType",
            "value": event.charAt(0).toUpperCase() + event.slice(1),
            "hidden": true
        });
        return results;
    }
}
