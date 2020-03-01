/**
 * Comscore
 * https://direct.comscore.com/clients/help/FAQ.aspx#faqTagging
 *
 * @class
 * @extends BaseProvider
 */

class ComscoreProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "COMSCORE";
        this._pattern = /sb\.scorecardresearch\.com(?!.*\.js($|[?#]))/;
        this._name = "Comscore";
        this._type = "marketing";
    }

    /**
   * Retrieve the column mappings for default columns (account, event type)
   *
   * @return {{}}
   */
    get columnMapping() {
        return {
            account: "c2",
            requestType: "c1"
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
                key: "custom",
                name: "Custom"
            }
        ];
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
        const customRegex = /^c\S+$/;
        if (name.match(customRegex)) {
            result = {
                key: name,
                field: name,
                value: value,
                group: "custom"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }
}
