/**
 * WebTrends OnDemand
 * https://www.webtrends.com/
 *
 * @class
 * @extends BaseProvider
 */
class WebtrendsOnDemandProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "WEBTRENDSONDEMAND";
        this._pattern    = /\/dcs\.gif/;
        this._name       = "Webtrends OnDemand";
        this._type       = "analytics";
        this._keywords   = ["webtrends", "analytics", "ondemand", "on demand"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "accountID",
            "requestType":  "requestType"
        }
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
                "name": "General",
            },
            {
                "key": "marketing",
                "name": "Marketing / Traffic Source",
            },
            {
                "key": "scenario",
                "name": "Scenario Analysis",
            },
            {
                "key": "ecom",
                "name": "E-commerce",
            },
            {
                "key": "clicks",
                "name": "Click Event",
            },
            {
                "key": "search",
                "name": "Site Search",
            },
            {
                "key": "headers",
                "name": "Captured HTTP Headers",
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
            "WT.vt_tlv": {
                "name": "Time of last visit (SDC)",
                "group": "other"
            },
            "WT.vt_f_tlv": {
                "name": "Time of last visit (cookie)",
                "group": "other"
            },
            "WT.vt_f_tlh": {
                "name": "Time of last hit",
                "group": "other"
            },
            "WT.vt_d": {
                "name": "First visitor hit today (EA)",
                "group": "other"
            },
            "WT.vt_a_d": {
                "name": "First visitor hit today (ARDS)",
                "group": "other"
            },
            "WT.s": {
                "name": "First visitor hit this account (ARDS)",
                "group": "other"
            },
            "WT.vt_f_d": {
                "name": "First visitor hit today (cookie)",
                "group": "other"
            },
            "WT.vt_s": {
                "name": "First visitor hit this session",
                "group": "other"
            },
            "WT.vt_f_s": {
                "name": "First visitor hit this session (cookie)",
                "group": "other"
            },
            "WT.vt_f": {
                "name": "First visitor hit (cookie)",
                "group": "other"
            },
            "WT.vt_f_a": {
                "name": "First visitor hit this account (cookie)",
                "group": "other"
            },
            "WT.vtid": {
                "name": "Session ID",
                "group": "general"
            },
            "WT.dcsvid": {
                "name": "User ID",
                "group": "general"
            },
            "WT.vtvs": {
                "name": "Visitor session (timestamp)",
                "group": "other"
            },
            "WT.co": {
                "name": "Client accepting cookies",
                "group": "other"
            },
            "WT.ce": {
                "name": "Cookie type (first/third party)",
                "group": "other"
            },
            "WT.co_d": {
                "name": "Session stitching ID",
                "group": "other"
            },
            "WT.co_a": {
                "name": "Multi account rollup ID",
                "group": "general"
            },
            "WT.co_f": {
                "name": "Visitor session ID",
                "group": "general"
            },
            "WT.tu": {
                "name": "Metrics URL truncated",
                "group": "other"
            },
            "WT.hdr": {
                "name": "Custom HTTP header tracking",
                "group": "other"
            },
            "WT.tv": {
                "name": "Webtrends JS tag version",
                "group": "general"
            },
            "WT.site": {
                "name": "Site ID",
                "group": "general"
            },
            "WT.tsrc": {
                "name": "Custom traffic source",
                "group": "marketing"
            },
            "WT.nv": {
                "name": "Parent div/table ID",
                "group": "clicks"
            },
            "WT.es": {
                "name": "Event source",
                "group": "clicks"
            },
            "WT.dcs_id": {
                "name": "DCSID",
                "group": "general"
            },
            "WT.cg_n": {
                "name": "Content group name",
                "group": "general"
            },
            "WT.cg_s": {
                "name": "Content sub-group name",
                "group": "general"
            },
            "WT.mc_id": {
                "name": "Marketing campaign",
                "group": "marketing"
            },
            "WT.mc_ev": {
                "name": "Marketing campaign clickthrough",
                "group": "marketing"
            },
            "WT.ad": {
                "name": "Advertising view",
                "group": "marketing"
            },
            "WT.ac": {
                "name": "Advertising click",
                "group": "marketing"
            },
            "WT.sv": {
                "name": "Server name",
                "group": "general"
            },
            "WT.si_n": {
                "name": "Scenario name",
                "group": "scenario"
            },
            "WT.si_p": {
                "name": "Scenario step name",
                "group": "scenario"
            },
            "WT.si_x": {
                "name": "Scenario step position",
                "group": "scenario"
            },
            "WT.si_cs": {
                "name": "Scenario conversion",
                "group": "scenario"
            },
            "WT.ti": {
                "name": "Page title",
                "group": "general"
            },
            "WT.sp": {
                "name": "Split log file",
                "group": "general"
            },
            "WT.srch": {
                "name": "Search engine type",
                "group": "marketing"
            },
            "WT.tz": {
                "name": "Browser time zone",
                "group": "other"
            },
            "WT.bh": {
                "name": "Browser time (hour)",
                "group": "other"
            },
            "WT.ul": {
                "name": "Browser language",
                "group": "other"
            },
            "WT.cd": {
                "name": "Color depth",
                "group": "other"
            },
            "WT.sr": {
                "name": "Screen resolution",
                "group": "other"
            },
            "WT.js": {
                "name": "JavaScript enabled",
                "group": "other"
            },
            "WT.jv": {
                "name": "JavaScript version",
                "group": "other"
            },
            "WT.jo": {
                "name": "Java enabled",
                "group": "other"
            },
            "WTT.jo": {
                "name": "Cookie type",
                "group": "other"
            },
            "WT.slv": {
                "name": "Silverlight enabled",
                "group": "other"
            },
            "WT.fv": {
                "name": "Flash version",
                "group": "other"
            },
            "WT.ct": {
                "name": "Connection Type",
                "group": "other"
            },
            "WT.hp": {
                "name": "Page is browser's homepage",
                "group": "other"
            },
            "WT.bs": {
                "name": "Browser resolution",
                "group": "other"
            },
            "WT.le": {
                "name": "Browser charset",
                "group": "other"
            },
            "WT.pn_sku": {
                "name": "Product SKU",
                "group": "ecom"
            },
            "WT.pn_id": {
                "name": "Product ID",
                "group": "ecom"
            },
            "WT.pn_fa": {
                "name": "Product family",
                "group": "ecom"
            },
            "WT.pn_gr": {
                "name": "Product group",
                "group": "ecom"
            },
            "WT.pn_sc": {
                "name": "Product sub-category",
                "group": "ecom"
            },
            "WT.pn_ma": {
                "name": "Product manufacturer",
                "group": "ecom"
            },
            "WT.pn_su": {
                "name": "Product supplier",
                "group": "ecom"
            },
            "WT.tx_u": {
                "name": "Transaction total quantity",
                "group": "ecom"
            },
            "WT.tx_s": {
                "name": "Transaction total cost",
                "group": "ecom"
            },
            "WT.tx_e": {
                "name": "Transaction type",
                "group": "ecom"
            },
            "WT.tx_i": {
                "name": "Transaction ID",
                "group": "ecom"
            },
            "WT.tx_id": {
                "name": "Transaction date",
                "group": "ecom"
            },
            "WT.tx_it": {
                "name": "Transaction time",
                "group": "ecom"
            },
            "WT.pi": {
                "name": "Page ID",
                "group": "general"
            },
            "WT.oss": {
                "name": "Site search term",
                "group": "search"
            },
            "WT.oss_r": {
                "name": "Site search result count",
                "group": "search"
            },
            "WT.rv": {
                "name": "Registered visitor",
                "group": "general"
            },
            "dcsid": {
                "name": "Account ID",
                "group": "general"
            },
            "dcsref": {
                "name": "Page referer",
                "group": "general"
            },
            "dcssip": {
                "name": "Page domain",
                "group": "general"
            },
            "dcsuri": {
                "name": "Page path",
                "group": "general"
            },
            "dcsua": {
                "name": "User-Agent ",
                "group": "other"
            },
            "dcspro": {
                "name": "Page protocol",
                "group": "general"
            },
            "dcsqry": {
                "name": "Page query string",
                "group": "general"
            },
            "dcsaut": {
                "name": "Auth username",
                "group": "general"
            },
            "dcsmet": {
                "name": "Method",
                "group": "other"
            },
            "dcssta": {
                "name": "Status",
                "group": "other"
            },
            "dcsbyt": {
                "name": "Request size",
                "group": "other"
            },
            "dcscip": {
                "name": "IP Address",
                "group": "other"
            },
            "dcsdat": {
                "name": "Cache buster",
                "group": "other"
            },
            "WT.ssl": {
                "name": "Page is SSL",
                "group": "other"
            },
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
    handleQueryParam(name, value)
    {
        // Double encoded values plague WT params...
        value = decodeURIComponent(value);

        let result = {};
        if(name === "WT.dl") {
            result = {
                "key": name,
                "field": "Event Type",
                "value": `${value} (${this._getRequestType(value)})`,
                "group": "general"
            }
        } else if(/^WT\.hdr\.(.*)/i.test(name)) {
            result = {
                "key":   name,
                "field": RegExp.$1,
                "value": value,
                "group": "headers"
            };
        } else if(/^(?:WT\.seg_)(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Segment of interest " + RegExp.$1,
                "value": value,
                "group": "general"
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
    handleCustom(url, params)
    {
        let results = [],
            accountID = url.pathname.match(/^\/([^\/]+)\/dcs\.gif/),
            requestType = this._getRequestType(params.get("WT.dl"));

        if(accountID) {
            results.push({
                "key":   "accountID",
                "field": "Account ID",
                "value": accountID[1],
                "group": "general",
            });
        }

        results.push({
            "key":   "requestType",
            "value": requestType,
            "hidden": true
        });
        return results;
    }

    /**
     * Get the request type based on the key
     * https://help.webtrends.com/legacy/en/Analytics10/event_tracking.html
     *
     * @param key
     * @returns string
     * @private
     */
    _getRequestType(key) {
        let table = {
            0: "Page View",
            20: "Download Click",
            21: "Anchor Click",
            22: "javascript: Click",
            23: "mailto: Click",
            24: "Exit Click",
            25: "Right-Click",
            26: "Form Submit - GET",
            27: "Form Submit - POST",
            28: "Form Button Click - Input",
            29: "Form Button Click - Button",
            30: "Image Map Click"
        };
        return table[key] || key;
    }
}
