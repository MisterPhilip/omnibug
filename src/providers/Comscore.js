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
    this._pattern = /sb\.scorecardresearch\.com.+(?<!\.js)$/;
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
      requestType: "requestType"
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
        key: "general",
        name: "General"
      },
      {
        key: "custom",
        name: "Custom"
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
      c1: {
        name: "Tag Type",
        group: "general"
      },
      c2: {
        name: "Client ID",
        group: "general"
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

    if (name.startsWith("c")) {
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
      c1 = params.get("c1"),
      c2 = params.get("c2");

    if (c1) {
      results.push({
        key: "tagType",
        field: "Tag Type",
        value: c1,
        group: "general"
      });
    }

    if (c2) {
      results.push({
        key: "clientID",
        field: "Client ID",
        value: c2,
        group: "general"
      });
    }

    return results;
  }
}
