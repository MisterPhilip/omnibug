/**
 * Glassbox
 *
 * @class
 * @extends BaseProvider
 */

class GlassboxProvider extends BaseProvider {
    constructor() {
        super();
        this._key       = "GLASSBOX";
        this._pattern   = /\/cls_report\/?\?clsjsv=/;
        this._name      = "Glassbox";
        this._type      = "replay";
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
                "key": "event",
                "name": "Event Data"
            },
            {
                "key": "configuration",
                "name": "Configuration"
            },
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
            "clsjsv" : {
                "name": "Library Version",
                "group": "other"
            },
            "r" : {
                "name": "Referrer",
                "group": "general"
            },
            "seg" : {
                "name": "Page",
                "group": "general"
            },
            "_cls_s" : {
                "name": "Session Cookie",
                "group": "general"
            },
            "_cls_v" : {
                "name": "Video Cookie",
                "group": "general"
            },
            "pid" : {
                "name": "Page ID",
                "group": "general"
            },
            "p" : {
                "name": "Page ID",
                "group": "other"
            },
            "e" : {
                "name": "Event Data",
                "group": "event"
            },
        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array|Object}
     */
    parsePostData(postData = "") {
        let params = [];
        // Handle POST data first, if applicable (treat as query params)
        if (typeof postData === "string" && postData !== "") {
            let keyPairs = postData.split("&");
            keyPairs.forEach((keyPair) => {
                let splitPair = keyPair.split("=");
                params.push([splitPair[0], decodeURIComponent(splitPair[1] || "")]);
            });
        } else if (typeof postData === "object") {
            Object.entries(postData).forEach((entry) => {
                // @TODO: consider handling multiple values passed?
                params.push([entry[0], entry[1].toString()]);
            });
        }
        return params;
    }
}
