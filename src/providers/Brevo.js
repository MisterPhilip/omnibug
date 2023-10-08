/**
 * Brevo (f/k/a Sendinblue)
 * https://developers.brevo.com/docs/gettings-started-with-sendinblue-tracker
 *
 * @class
 * @extends BaseProvider
 */
class BrevoProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "BREVO";
        this._pattern = /in-automate\.brevo\.com\/p/;
        this._name = "Brevo";
        this._type = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "key",
            "requestType": "sib_type"
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
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "key": {
                "name": "Tracking ID",
                "group": "general"
            },
            "sib_type": {
                "name": "Request Type",
                "group": "general"
            }
        };
    }
}
