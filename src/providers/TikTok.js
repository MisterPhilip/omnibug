/**
 * TikTok Tracking Events
 *
 *
 * @class
 * @extends BaseProvider
 */
class TikTokProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "TIKTOK";
        this._pattern = /business\.topbuzz\.com\/2\/wap\/landing_tetris_log\//;
        this._name = "TikTok";
        this._type = "marketing";
        this._keywords = ["TikTok"];
    }
    
    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "track_data[advertiser_id]",
            "requestType": "track_data[event_type]"
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
            },
            {
                "key": "event",
                "name": "Event Data"
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
            "device_id": {
                "name": "Device ID",
                "group": "general"
            },
            "user_id": {
                "name": "User ID",
                "group": "general"
            },
            "uid": {
                "name": "UID",
                "group": "general"
            },
            "ut": {
                "name": "UT",
                "group": "general"
            },
            "client_version": {
                "name": "Client Version",
                "group": "general"
            },
            "version_code": {
                "name": "Version Code",
                "group": "general"
            },
            "req_id": {
                "name": "Request ID",
                "group": "general"
            },
            "cid": {
                "name": "Client ID",
                "group": "general"
            },
            "site_id": {
                "name": "Site ID",
                "group": "general"
            },
            "ad_id": {
                "name": "Ad ID",
                "group": "general"
            },
            "tt_bridge": {
                "name": "TikTok Bridge",
                "group": "general"
            },
            "tt_env": {
                "name": "TikTok Environment",
                "group": "general"
            },
            "app_id": {
                "name": "App ID",
                "group": "general"
            },
            "source": {
                "name": "Source",
                "group": "general"
            },
            "sdk_version": {
                "name": "SDK Version",
                "group": "general"
            },
            "t": {
                "name": "Date-Time Stamp",
                "group": "general"
            },
            "track_data[event_type]": {
                "name": "Event Type",
                "group": "event"
            },
            "track_data[event_pixel_id]": {
                "name": "Event Pixel ID",
                "group": "event"
            },
            "track_data[advertiser_id]": {
                "name": "Advertiser ID",
                "group": "event"
            },
            "track_data[data_type]": {
                "name": "Data Type",
                "group": "event"
            },
            "track_data[options]": {
                "name": "Options",
                "group": "event"
            },
            "track_data[log_extra]": {
                "name": "Log Extra",
                "group": "event"
            },
            "track_data[os]": {
                "name": "Operating System",
                "group": "event"
            },
            "track_data[page_url]": {
                "name": "Page URL",
                "group": "event"
            },
            "track_data[page_type]": {
                "name": "Page Type",
                "group": "event"
            }
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
        if (name === "track_data") {
            // do handling in custom
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
    handleCustom(url, params) {
        let results = [],
            eventData = params.get("track_data"),
            requestType = "Event";

        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": true
        });

        // Any event-data
        if (eventData) {
            try {
                let data = JSON.parse(eventData);
                if (typeof data === "object" && data !== null){
                    Object.entries(data).forEach(([key, data]) => {
                        Object.entries(data).forEach(([key, data]) => {
                            let result = super.handleQueryParam(`track_data[${key}]`, data);
                            if (result) {
                                results.push(result);
                            }                           
                        });
                    }); 
                }

            } catch (e) {
                results.push({
                    "key": "track_event",
                    "field": "Events",
                    "value": eventData,
                    "group": "events"
                });
            }
        }

        return results;
    }
}