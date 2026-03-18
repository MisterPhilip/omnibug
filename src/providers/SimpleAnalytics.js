class SimpleAnalyticsProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key      = "SIMPLEANALYTICS";
        this._pattern  = /^https?:\/\/queue\.simpleanalytics(?:cdn)?\.com\/(?:events|simple\.gif)(?:\?.*)?$/;
        this._name     = "Simple Analytics";
        this._type     = "analytics";
        this._keywords = ["simpleanalytics", "simple analytics", "sa"];
    }

    get columnMapping()
    {
        return {
            "account": "hostname",
            "requestType": "omnibug_requestType"
        };
    }

    get groups()
    {
        return [
            {
                "key": "general",
                "name": "General"
            },
            {
                "key": "engagement",
                "name": "Engagement"
            },
            {
                "key": "metadata",
                "name": "Metadata"
            }
        ];
    }

    get keys()
    {
        return {
            "version": {
                "name": "Version",
                "group": "general"
            },
            "hostname": {
                "name": "Hostname",
                "group": "general"
            },
            "path": {
                "name": "Path",
                "group": "general"
            },
            "type": {
                "name": "Type",
                "group": "general"
            },
            "url": {
                "name": "Page URL",
                "group": "general"
            },
            "ua": {
                "name": "User Agent",
                "group": "general"
            },
            "https": {
                "name": "HTTPS",
                "group": "general"
            },
            "timezone": {
                "name": "Timezone",
                "group": "general"
            },
            "language": {
                "name": "Language",
                "group": "general"
            },
            "unique": {
                "name": "Is Unique Visit",
                "group": "engagement"
            },
            "page_id": {
                "name": "Page ID",
                "group": "engagement"
            },
            "session_id": {
                "name": "Session ID",
                "group": "engagement"
            },
            "mobile": {
                "name": "Mobile",
                "group": "engagement"
            },
            "screen_width": {
                "name": "Screen Width",
                "group": "engagement"
            },
            "screen_height": {
                "name": "Screen Height",
                "group": "engagement"
            },
            "viewport_width": {
                "name": "Viewport Width",
                "group": "engagement"
            },
            "viewport_height": {
                "name": "Viewport Height",
                "group": "engagement"
            },
            "metadata": {
                "name": "Custom Metadata",
                "group": "metadata"
            }
        };
    }

    handleCustom(_, params)
{
    let results = [],
        type = (params.get("type") || "").toLowerCase(),
        event = params.get("event") || "",
        requestType = "Event";

    if (type === "pageview") {
        requestType = "Page View";
    } else if (type === "event" && event) {
        requestType = event.charAt(0).toUpperCase() + event.slice(1);
    } else if (type) {
        requestType = type.charAt(0).toUpperCase() + type.slice(1);
    }

    results.push({
        "key": "omnibug_requestType",
        "value": requestType,
        "hidden": true
    });

    return results;
}
}