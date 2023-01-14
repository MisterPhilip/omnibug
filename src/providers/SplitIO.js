/**
 * SplitIO Events and Impressions
 *
 * @class
 * @extends BaseProvider
 */
class SplitIOProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "SPLITIO";
        this._pattern = /events\.split\.io\/api\/(events\/(beacon|bulk)|testImpressions\/(count\/beacon|beacon|bulk))/;
        this._name = "SplitIO";
        this._type = "analytics";
        this._keywords = ["splitio", "abtest", "insight"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "preview",
            "requestType": "requestType",
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
     * Parse a given URL into human-readable output
     *
     * @param {string}  rawUrl      A URL to check against
     * @param {string}  postData    POST data, if applicable
     *
     * @return {{provider: {name: string, key: string, type: string}, data: Array}}
     */
    parseUrl(rawUrl, postData = "") {
        const url = new URL(rawUrl);

        return {
            "provider": {
                "name": this.name,
                "key": this.key,
                "type": this.type,
                "columns": this.columnMapping,
                "groups": this.groups
            },
            "data": this.buildData(url, postData)
        };
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param    {URL}   url
     * @param    {string}   postData
     *
     * @returns {Array}
     */
    buildData(url, postData) {
        const parsedData = JSON.parse(postData);
        const isBeacon = url.pathname.includes("beacon");
        const isEvents = url.pathname.includes("events");
        let entries;
        if (isEvents || !url.pathname.includes("count")) {
            entries = (isBeacon ? parsedData.entries : parsedData) || [];
        } else {
            entries = parsedData.entries.pf;
        }

        const metadata = isBeacon ? [{
            "key": "token",
            "value": parsedData.token,
            "field": "API Key",
            "group": "other",
        }, {
            "key": "sdk",
            "value": parsedData.sdk,
            "field": "SDK",
            "group": "other",
        }] : [];

        const contents = isEvents ? (entries.flatMap(entry => [{
            "key": "eventName",
            "value": entry.eventTypeId,
            "field": "Event Name",
            "group": "general"
        }, {
            "key": "eventProperties",
            "value": JSON.stringify(entry.properties, undefined, 2),
            "field": "Event Properties",
            "group": "general"
        }, {
            "key": "eventAttributes",
            "value": JSON.stringify({trafficType: entry.trafficTypeName, value: entry.value, sdk: entry.sdk}, undefined, 2),
            "field": "Event Attributes",
            "group": "general"
        }])) : (entries.flatMap(entry => [{
            "key": "splitName",
            "value": entry.f,
            "field": "Split Name",
            "group": "general"
        }]));

        return [
            {
                "key": "preview",
                "value": entries.map(e => isEvents ? e.eventTypeId : e.f).join(","),
                "field": "Preview",
                "group": "other",
            },
            {
                "key": "transferType",
                "value": isBeacon ? "beacon" : "bulk (sdk)",
                "field": "Transfer type",
                "group": "other",
            },
            {
                "key": "requestType",
                "value": (isEvents ? "Events" : "Impressions") + " (" + entries.length + ")",
                "field": "Request type",
                "group": "other",
            },
            ...metadata,
            ...contents,
        ];
    }
}