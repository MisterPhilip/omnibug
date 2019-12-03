/**
 * Matomo (Formerly Piwik)
 * http://matomo.org
 *
 * @class
 * @extends BaseProvider
 */
class MatomoProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "MATOMO";
        this._pattern = /\/(piwik|matomo)\.php\?/;
        this._name = "Matomo";
        this._type = "analytics";
        this._keywords = ["piwik"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "trackingServer",
            "requestType": "requestType"
        }
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
            },
            {
                "key": "dimensions",
                "name": "Dimensions"
            },
            {
                "key": "custom",
                "name": "Custom Variables"
            },
            {
                "key": "ecommerce",
                "name": "E-commerce"
            },
            {
                "key": "events",
                "name": "Events"
            },
            {
                "key": "content",
                "name": "Content"
            },
            {
                "key": "media",
                "name": "Media"
            }
        ];
    }

    /**+
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys() {
        return {
            "idsite": {
                "name": "Website ID",
                "group": "general"
            },
            "rec": {
                "name": "Required for Tracking",
                "group": "other"
            },
            "action_name": {
                "name": "Action Name",
                "group": "general"
            },
            "url": {
                "name": "Page URL",
                "group": "general"
            },
            "_id": {
                "name": "Visitor ID",
                "group": "general"
            },
            "rand": {
                "name": "Cache Buster",
                "group": "other"
            },
            "apiv": {
                "name": "API Version",
                "group": "other"
            },
            "urlref": {
                "name": "Page Referrer",
                "group": "general"
            },
            "_idvc": {
                "name": "Visit Number",
                "group": "general"
            },
            "_viewts": {
                "name": "Previous Visit Timestamp",
                "group": "other"
            },
            "_idts": {
                "name": "First Visit Timestamp",
                "group": "other"
            },
            "_rcn": {
                "name": "Campaign Name",
                "group": "general"
            },
            "_rck": {
                "name": "Campaign Keyword",
                "group": "general"
            },
            "res": {
                "name": "Screen Resolution",
                "group": "other"
            },
            "h": {
                "name": "Browser Time (Hour)",
                "group": "other"
            },
            "m": {
                "name": "Browser Time (Minute)",
                "group": "other"
            },
            "s": {
                "name": "Browser Time (Sectond)",
                "group": "other"
            },
            "fla": {
                "name": "Has Plugin: Flash",
                "group": "other"
            },
            "java": {
                "name": "Has Plugin: Java",
                "group": "other"
            },
            "dir": {
                "name": "Has Plugin: Director",
                "group": "other"
            },
            "qt": {
                "name": "Has Plugin: Quicktime",
                "group": "other"
            },
            "realp": {
                "name": "Has Plugin: Real Player",
                "group": "other"
            },
            "pdf": {
                "name": "Has Plugin: PDF",
                "group": "other"
            },
            "wma": {
                "name": "Has Plugin: Windows Media Player",
                "group": "other"
            },
            "gears": {
                "name": "Has Plugin: Gears",
                "group": "other"
            },
            "ag": {
                "name": "Has Plugin: Silverlight",
                "group": "other"
            },
            "cookie": {
                "name": "Browser Supports Cookies",
                "group": "other"
            },
            "ua": {
                "name": "User Agent",
                "group": "general"
            },
            "lang": {
                "name": "Browser Language",
                "group": "general"
            },
            "uid": {
                "name": "User ID",
                "group": "general"
            },
            "cid": {
                "name": "Visitor ID",
                "group": "general"
            },
            "new_visit": {
                "name": "Force New Visit",
                "group": "general"
            },
            "exit": {
                "name": "Exit Link",
                "group": "general"
            },
            "link": {
                "name": "Exit Link",
                "group": "general"
            },
            "download": {
                "name": "Download Link",
                "group": "general"
            },
            "search": {
                "name": "Site Search Keyword",
                "group": "general"
            },
            "search_cat": {
                "name": "Site Search Category",
                "group": "general"
            },
            "search_count": {
                "name": "Site Search Results Count",
                "group": "general"
            },
            "pv_id": {
                "name": "Page View ID",
                "group": "general"
            },
            "idgoal": {
                "name": "Goal ID",
                "group": "general"
            },
            "revenue": {
                "name": "Revenue",
                "hidden": true
            },
            "gt_ms": {
                "name": "Action Generation Time (ms)",
                "group": "other"
            },
            "e_c": {
                "name": "Event Category",
                "group": "events"
            },
            "e_a": {
                "name": "Event Action",
                "group": "events"
            },
            "e_n": {
                "name": "Event Name",
                "group": "events"
            },
            "e_v": {
                "name": "Event Value",
                "group": "events"
            },
            "c_n": {
                "name": "Content Name",
                "group": "content"
            },
            "c_p": {
                "name": "Content Piece",
                "group": "content"
            },
            "c_t": {
                "name": "Content Target",
                "group": "content"
            },
            "c_i": {
                "name": "Content Interaction",
                "group": "content"
            },
            "ec_id": {
                "name": "Order ID",
                "group": "ecommerce"
            },
            "ec_st": {
                "name": "Sub-total",
                "group": "ecommerce"
            },
            "ec_tx": {
                "name": "Tax",
                "group": "ecommerce"
            },
            "ec_sh": {
                "name": "Shipping",
                "group": "ecommerce"
            },
            "ec_dt": {
                "name": "Discount",
                "group": "ecommerce"
            },
            "_ects": {
                "name": "Previous Order Timestamp",
                "group": "ecommerce"
            },
            "token_auth": {
                "name": "API Token",
                "group": "other"
            },
            "cip": {
                "name": "Visitor IP",
                "group": "other"
            },
            "cdt": {
                "name": "Request Timestamp",
                "group": "other"
            },
            "country": {
                "name": "Country",
                "group": "general"
            },
            "region": {
                "name": "Region",
                "group": "general"
            },
            "city": {
                "name": "City",
                "group": "general"
            },
            "lat": {
                "name": "Latitude",
                "group": "general"
            },
            "long": {
                "name": "Longitude",
                "group": "general"
            },
            "queuedtracking": {
                "name": "Queue Tracking",
                "group": "other",
            },
            "ping": {
                "name": "Ping",
                "group": "other"
            },
            "ma_id": {
                "name": "Media ID",
                "group": "media"
            },
            "ma_ti": {
                "name": "Media Title",
                "group": "media"
            },
            "ma_re": {
                "name": "Media Resource",
                "group": "media"
            },
            "ma_mt": {
                "name": "Media Type",
                "group": "media"
            },
            "ma_pn": {
                "name": "Media Player Name",
                "group": "media"
            },
            "ma_st": {
                "name": "Media Duration (sec)",
                "group": "media"
            },
            "ma_ps": {
                "name": "Current Position",
                "group": "media"
            },
            "ma_ttp": {
                "name": "Time Until Media Played",
                "group": "media"
            },
            "ma_w": {
                "name": "Media Width",
                "group": "media"
            },
            "ma_h": {
                "name": "Media Height",
                "group": "media"
            },
            "ma_fs": {
                "name": "Fullscreen Media",
                "group": "media"
            },
            "ma_se": {
                "name": "Media Positions Played",
                "group": "media"
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
        if (name === "_cvar") {
            result = {
                "key": "_cvar",
                "hidden": true
            };
        } else if (name === "ec_items") {
            result = {
                "key": "ec_items",
                "hidden": true
            };
        } else if (/^dimension(\d+)$/.test(name)) {
            result = {
                "key": name,
                "field": `Dimension ${RegExp.$1}`,
                "value": value,
                "group": "dimensions"
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
     * @returns {void|Array}
     */
    handleCustom(url, params) {
        let results = [],
            revenue = params.get("revenue"),
            _cvar = params.get("_cvar"),
            ec_items = params.get("ec_items"),
            requestType = "Page View";

        // Change the revenue group/name based on if an ecom order was placed
        if (revenue) {
            if (params.get("ec_id")) {
                results.push({
                    "key": "revenue",
                    "field": "Order Revenue",
                    "value": params.get("revenue"),
                    "group": "ecommerce"
                });
            } else if (params.get("ec_items")) {
                results.push({
                    "key": "revenue",
                    "field": "Cart Revenue",
                    "value": params.get("revenue"),
                    "group": "ecommerce"
                });
            } else {
                results.push({
                    "key": "revenue",
                    "field": "Goal Revenue",
                    "value": params.get("revenue"),
                    "group": "general"
                });
            }

        }

        // Custom Variables
        if (_cvar) {
            try {
                let customVars = JSON.parse(_cvar);
                if (typeof customVars === "object" && customVars) {
                    Object.entries(customVars).forEach(([key, [name, value]]) => {
                        results.push({
                            "key": `_cvar${key}n`,
                            "field": `Custom Variable ${key} Name`,
                            "value": name,
                            "group": "custom"
                        }, {
                            "key": `_cvar${key}v`,
                            "field": `Custom Variable ${key} Value`,
                            "value": value,
                            "group": "custom"
                        });
                    })
                }
            } catch (e) {
                // do nothing
                results.push({
                    "key": "_cvar",
                    "field": "Custom Variables",
                    "value": _cvar,
                    "group": "custom"
                });
            }
        }

        // Ecommerce products
        if (ec_items) {
            try {
                let products = JSON.parse(ec_items);
                if (typeof products === "object" && products.length) {
                    products.forEach(([sku, name, category, price, qty], i) => {
                        let j = i + 1;
                        results.push({
                            "key": `ec_item${j}s`,
                            "field": `Product ${j} SKU`,
                            "value": sku,
                            "group": "ecommerce"
                        }, {
                            "key": `ec_item${j}n`,
                            "field": `Product ${j} Name`,
                            "value": name,
                            "group": "ecommerce"
                        }, {
                            "key": `ec_item${j}c`,
                            "field": `Product ${j} Category`,
                            "value": (typeof category === "object" && category.length) ? category.join(", ") : category,
                            "group": "ecommerce"
                        }, {
                            "key": `ec_item${j}p`,
                            "field": `Product ${j} Price`,
                            "value": price.toString(),
                            "group": "ecommerce"
                        }, {
                            "key": `ec_item${j}q`,
                            "field": `Product ${j} Quantity`,
                            "value": qty.toString(),
                            "group": "ecommerce"
                        });
                    })
                }
            } catch (e) {
                // do nothing
                results.push({
                    "key": "ec_items",
                    "field": "Products",
                    "value": ec_items,
                    "group": "ecommerce"
                });
            }
        }

        // Figure out the request type
        if (params.get("search")) {
            requestType = "Site Search";
        } else if (params.get("idgoal") === "0") {
            requestType = "Ecommerce";
        } else if (params.get("idgoal")) {
            requestType = "Goal";
        } else if (params.get("exit") || params.get("link")) {
            requestType = "Exit Click";
        } else if (params.get("download")) {
            requestType = "Download Click";
        } else if (params.get("c_i")) {
            requestType = "Content Interaction";
        } else if (params.get("e_c")) {
            requestType = "Custom Event"
        } else if (params.get("ping")) {
            requestType = "Ping";
        }

        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": "true"
        });

        // Where the request was sent
        results.push({
            "key": "trackingServer",
            "field": "Tracking Server",
            "value": url.hostname,
            "group": "general"
        });

        return results;
    }
}