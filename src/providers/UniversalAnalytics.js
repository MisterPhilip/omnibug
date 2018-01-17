/**
 * Universal Analytics
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/
 *
 * @class
 * @extends BaseProvider
 */
class UniversalAnalyticsProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "UNIVERSALANALYTICS";
        this._pattern    = /\.(google-analytics\.com|doubleclick\.net)\/(r\/)?collect[\/?]/;
        this._name       = "Universal Analytics";
        this._type       = "analytics";
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "v": {
                "name": "Protocol Version",
                "group": "General"
            },
            "tid": {
                "name": "Tracking ID",
                "group": "General"
            },
            "aip": {
                "name": "Anonymize IP",
                "group": "General"
            },
            "qt": {
                "name": "Queue Time",
                "group": "General"
            },
            "z": {
                "name": "Cache Buster",
                "group": "General"
            },
            "cid": {
                "name": "Client ID",
                "group": "General"
            },
            "sc": {
                "name": "Session Control",
                "group": "General"
            },
            "dr": {
                "name": "Document Referrer",
                "group": "General"
            },
            "cn": {
                "name": "Campaign Name",
                "group": "Campaign"
            },
            "cs": {
                "name": "Campaign Source",
                "group": "Campaign"
            },
            "cm": {
                "name": "Campaign Medium",
                "group": "Campaign"
            },
            "ck": {
                "name": "Campaign Keyword",
                "group": "Campaign"
            },
            "cc": {
                "name": "Campaign Content",
                "group": "Campaign"
            },
            "ci": {
                "name": "Campaign ID",
                "group": "Campaign"
            },
            "gclid": {
                "name": "Google AdWords ID",
                "group": "Campaign"
            },
            "dclid": {
                "name": "Google Display Ads ID",
                "group": "Campaign"
            },
            "sr": {
                "name": "Screen Resolution",
                "group": "General"
            },
            "vp": {
                "name": "Viewport Size",
                "group": "General"
            },
            "de": {
                "name": "Document Encoding",
                "group": "General"
            },
            "sd": {
                "name": "Screen Colors",
                "group": "General"
            },
            "ul": {
                "name": "User Language",
                "group": "General"
            },
            "je": {
                "name": "Java Enabled",
                "group": "General"
            },
            "fl": {
                "name": "Flash Version",
                "group": "General"
            },
            "t": {
                "name": "Hit Type",
                "group": "General"
            },
            "ni": {
                "name": "Non-Interaction Hit",
                "group": "Events"
            },
            "dl": {
                "name": "Document location URL",
                "group": "General"
            },
            "dh": {
                "name": "Document Host Name",
                "group": "General"
            },
            "dp": {
                "name": "Document Path",
                "group": "General"
            },
            "dt": {
                "name": "Document Title",
                "group": "General"
            },
            "cd": {
                "name": "Content Description",
                "group": "General"
            },
            "an": {
                "name": "Application Name",
                "group": "General"
            },
            "av": {
                "name": "Application Version",
                "group": "General"
            },
            "ec": {
                "name": "Event Category",
                "group": "Events"
            },
            "ea": {
                "name": "Event Action",
                "group": "Events"
            },
            "el": {
                "name": "Event Label",
                "group": "Events"
            },
            "ev": {
                "name": "Event Value",
                "group": "Events"
            },
            "ti": {
                "name": "Transaction ID",
                "group": "Ecommerce"
            },
            "ta": {
                "name": "Transaction Affiliation",
                "group": "Ecommerce"
            },
            "tr": {
                "name": "Transaction Revenue",
                "group": "Ecommerce"
            },
            "ts": {
                "name": "Transaction Shipping",
                "group": "Ecommerce"
            },
            "tt": {
                "name": "Transaction Tax",
                "group": "Ecommerce"
            },
            "in": {
                "name": "Item Name",
                "group": "Ecommerce"
            },
            "ip": {
                "name": "Item Price",
                "group": "Ecommerce"
            },
            "iq": {
                "name": "Item Quantity",
                "group": "Ecommerce"
            },
            "ic": {
                "name": "Item Code",
                "group": "Ecommerce"
            },
            "iv": {
                "name": "Item Category",
                "group": "Ecommerce"
            },
            "cu": {
                "name": "Currency Code",
                "group": "Ecommerce"
            },
            "sn": {
                "name": "Social Network",
                "group": "Events"
            },
            "sa": {
                "name": "Social Action",
                "group": "Events"
            },
            "st": {
                "name": "Social Action Target",
                "group": "Events"
            },
            "utc": {
                "name": "User Timing Category",
                "group": "Timing"
            },
            "utv": {
                "name": "User Timing Variable Name",
                "group": "Timing"
            },
            "utt": {
                "name": "User Timing Time",
                "group": "Timing"
            },
            "utl": {
                "name": "User timing Label",
                "group": "Timing"
            },
            "plt": {
                "name": "Page load time",
                "group": "Timing"
            },
            "dns": {
                "name": "DNS time",
                "group": "Timing"
            },
            "pdt": {
                "name": "Page download time",
                "group": "Timing"
            },
            "rrt": {
                "name": "Redirect response time",
                "group": "Timing"
            },
            "tcp": {
                "name": "TCP connect time",
                "group": "Timing"
            },
            "srt": {
                "name": "Server response time",
                "group": "Timing"
            },
            "exd": {
                "name": "Exception description",
                "group": "Events"
            },
            "exf": {
                "name": "Is exception fatal?",
                "group": "Events"
            },
            "ds": {
                "name": "Data Source",
                "group": "General"
            },
            "uid": {
                "name": "User ID",
                "group": "General"
            },
            "linkid": {
                "name": "Link ID",
                "group": "General"
            },
            "pa": {
                "name": "Product Action",
                "group": "Ecommerce"
            },
            "tcc": {
                "name": "Coupon Code",
                "group": "Ecommerce"
            },
            "pal": {
                "name": "Product Action List",
                "group": "Ecommerce"
            },
            "cos": {
                "name": "Checkout Step",
                "group": "Ecommerce"
            },
            "col": {
                "name": "Checkout Step Option",
                "group": "Ecommerce"
            },
            "promoa": {
                "name": "Promotion Action",
                "group": "Ecommerce"
            },
            "xid": {
                "name": "Content Experiment ID",
                "group": "Google Optimize"
            },
            "xvar": {
                "name": "Content Experiment Variant",
                "group": "Google Optimize"
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
    handleQueryParam(name, value)
    {
        let result = {};
        if(/^cd(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Dimension " + RegExp.$1,
                "value": value,
                "group": "Custom Dimensions"
            };
        } else if(/^cm(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Custom Metric " + RegExp.$1,
                "value": value,
                "group": "Custom Metrics"
            };
        } else if(/^cg(\d+)$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Content Group " + RegExp.$1,
                "value": value,
                "group": "Content Groups"
            };
        } else if(/^promo(\d+)([a-z]{2})$/i.test(name)) {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "cr": "Creative",
                    "ps": "Position"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Promotion " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Promotions"
            };
        } else if(/^pr(\d+)([a-z]{2})$/i.test(name)) {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "br": "Brand",
                    "ca": "Category",
                    "va": "Variant",
                    "pr": "Price",
                    "qt": "Quantity",
                    "cc": "Coupon Code",
                    "ps": "Position"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Product " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^pr(\d+)(cd|cm)(\d+)$/i.test(name)) {
            let lookup = {
                    "cd": "Custom Dimension",
                    "cm": "Custom Metric"
                },
                type = lookup[RegExp.$2] || "";
            result = {
                "key":   name,
                "field": "Product " + RegExp.$1 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)nm$/i.test(name)) {
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)pi(\d+)(cd|cm)(\d+)$/i.test(name)) {
            let lookup = {
                    "cd": "Custom Dimension",
                    "cm": "Custom Metric"
                },
                type = lookup[RegExp.$3] || "";
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1 + " Product " + RegExp.$2 + " " + type + " " + RegExp.$4,
                "value": value,
                "group": "Ecommerce"
            };
        } else if(/^il(\d+)pi(\d+)([a-z]{2})$/i.test(name)) {
            let lookup = {
                    "id": "ID",
                    "nm": "Name",
                    "br": "Brand",
                    "ca": "Category",
                    "va": "Variant",
                    "pr": "Price",
                    "ps": "Position"
                },
                type = lookup[RegExp.$3] || "";
            result = {
                "key":   name,
                "field": "Impression List " + RegExp.$1 + " Product " + RegExp.$2 + " " + type,
                "value": value,
                "group": "Ecommerce"
            };
        } else {
            result = super.handleQueryParam(name, value);
        }
        return result;
    }
}
OmnibugProvider.addProvider(new UniversalAnalyticsProvider());