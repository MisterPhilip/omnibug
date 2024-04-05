/**
 * Indicative
 *
 * @class
 * @extends BaseProvider
 */
class IndicativeProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "INDICATIVE";
        this._pattern = /api\.indicative\.com\/service\/event/;
        this._name = "Indicative";
        this._type = "analytics";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "apiKey",
            "requestType": "eventName"
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
                "key": "events",
                "name": "Event"
            },
            {
                "key": "eventproperties",
                "name": "Event Properties"
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
            "eventName": {
                "name": "Event Name",
                "group": "events"
            },
            "properties.value1Type": {
                "name": "Value 1 Type",
                "group": "eventproperties"
            },
            "properties.value1": {
                "name": "Value 1",
                "group": "eventproperties"
            },
            "properties.value2Type": {
                "name": "Value 2 Type",
                "group": "eventproperties"
            },
            "properties.value2": {
                "name": "Value 2",
                "group": "eventproperties"
            },
            "properties.value3Type": {
                "name": "Value 3 Type",
                "group": "eventproperties"
            },
            "properties.value3": {
                "name": "Value 3",
                "group": "eventproperties"
            },
        };
    }
}
