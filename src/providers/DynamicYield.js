/**
 * Dynamic Yield
 * https://dy.dev/docs/implement-script
 *
 * @class
 * @extends BaseProvider
 */
class DynamicYieldProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "DYNAMICYIELD";
        this._pattern = /async-px\.dynamicyield\.com\/(?:uia|imp|var|ac|id)/;
        this._name = "Dynamic Yield";
        this._type = "testing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "_omnibugAccount",
            "requestType": "_requestType",
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
     * Get all the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "se": {
                "name": "Section ID",
                "group": "general"
            },
            "sec": {
                "name": "Section ID",
                "group": "general"
            }
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
        const results = [];
        const accountId = params.get("sec") || params.get("se") || "";
        results.push({
            "key":   "_omnibugAccount",
            "value": accountId,
            "hidden": true,
        });

        const requestTypeMatch = url.pathname.replace(/\//g, "");
        let requestType = {
            "uia": "Page Info",
            "imp": "Monitor Units",
            "var": "Variation Impression",
            "ac": "Variation Click",
            "id": "User ID"
        }[requestTypeMatch] || "Other";

        results.push({
            "key": "_requestType",
            "value": requestType,
            "hidden": true,
        });

        return results;
    }
}
