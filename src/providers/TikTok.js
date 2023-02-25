/**
 * TikTok Tracking Events
 * No public documentation is available for the TikTok standard events, which must be defined in the TikTok Ads platform (not in GTM, etc.)
 * Events are currently being sent to API v1, but the provider regex is built to support future API versions (e.g. v2, v3, etc.)
 * 
 * @class
 * @extends BaseProvider
 */
class TikTokProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "TIKTOK";
        this._pattern = /https:\/\/analytics\.tiktok\.com\/api\/v[0-9]\/(?:track|pixel)/;
        this._name = "TikTok";
        this._type = "marketing";
        this._keywords = ["TikTok"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     * The account is unique to each TikTok pixel event, meaning multiple events firing from the same pixel SDK will have discreet identifiers
     * 
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "context.pixel.code",
            "requestType": "event"
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
                "key": "event",
                "name": "Event"
            },
            {
                "key": "context",
                "name": "Context"
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
            "event": {
                "name": "Event",
                "group": "event"
            },
            "sdkid": {
                "name": "SDK ID",
                "group": "event"
            },
            "analytics_uniq_id": {
                "name": "Analytics Unique ID",
                "group": "event"
            },
            "timestamp": {
                "name": "Timestamp",
                "group": "event"
            },
            "context.ad.ad_id": {
                "name": "Ad ID",
                "group": "context"
            },
            "context.ad.callback": {
                "name": "Ad Callback",
                "group": "context"
            },
            "context.ad.convert_id": {
                "name": "Ad Conversion ID",
                "group": "context"
            },
            "context.ad.creative_id": {
                "name": "Ad Creative ID",
                "group": "context"
            },
            "context.ad.idc": {
                "name": "Ad IDC",
                "group": "context"
            },
            "context.ad.log_extra": {
                "name": "Ad Log Extra",
                "group": "context"
            },
            "context.ad.req_id": {
                "name": "Ad Request ID",
                "group": "context"
            },
            "context.library.name": {
                "name": "Library Name",
                "group": "context"
            },
            "context.library.version": {
                "name": "Library Version",
                "group": "context"
            },
            "context.page.referrer": {
                "name": "Page Referrer",
                "group": "context"
            },
            "context.page.url": {
                "name": "Page URL",
                "group": "context"
            },
            "context.pixel.code": {
                "name": "Pixel Code",
                "group": "context"
            },
            "context.user.device_id": {
                "name": "Device ID",
                "group": "context"
            },
            "context.user.user_id": {
                "name": "User ID",
                "group": "context"
            }
        };
    }
}
