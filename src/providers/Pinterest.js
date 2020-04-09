/**
 * Pinterest Conversions
 * https://developers.pinterest.com/docs/ad-tools/conversion-tag/?
 *
 * @class
 * @extends BaseProvider
 */
class PinterestProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "PINTERESTPIXEL";
        this._pattern = /ct\.pinterest\.com\/v3\/?/;
        this._name = "Pinterest Conversion";
        this._type = "marketing";
        this._keywords = ["conversion", "pintrk", "pinimg"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping() {
        return {
            "account": "tid",
            "requestType": "requestType"
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
            },
            {
                "key": "event",
                "name": "Event Data"
            },
            {
                "key": "ecommerce",
                "name": "E-Commerce"
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
            "tid": {
                "name": "Tag ID",
                "group": "general"
            },
            "event": {
                "name": "Event",
                "group": "general"
            },
            "cb": {
                "name": "Cache Buster",
                "group": "other"
            },
            "noscript": {
                "name": "Image Tag",
                "group": "other"
            },
            "pd[em]": {
                "name": "Hashed Email Address",
                "group": "general"
            },
            "ed[value]": {
                "name": "Revenue",
                "group": "ecommerce"
            },
            "ed[order_quantity]": {
                "name": "Quantity",
                "group": "ecommerce"
            },
            "ed[currency]": {
                "name": "Currency",
                "group": "ecommerce"
            },
            "ed[order_id]": {
                "name": "Order ID",
                "group": "ecommerce"
            },
            "ed[promo_code]": {
                "name": "Promo Code",
                "group": "ecommerce"
            },
            "ed[property]": {
                "name": "Property",
                "group": "ecommerce"
            },
            "ed[search_query]": {
                "name": "Search Query",
                "group": "event"
            },
            "ed[video_title]": {
                "name": "Video Title",
                "group": "event"
            },
            "ed[lead_type]": {
                "name": "Lead Type",
                "group": "event"
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
        if (name === "ed") {
            // do handling in custom
        } else if (name === "pd") {
            // do handling in custom
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
            event = params.get("event") || /* istanbul ignore next: fallback */ "Other",
            pageData = params.get("pd"),
            eventData = params.get("ed"),
            requestType = "Conversion";

        // Request Type
        if (event === "pagevisit") {
            requestType = "Page View";
        } else {
            requestType = event.charAt(0).toUpperCase() + event.slice(1).split(/(?=[A-Z])/).join(" ");
        }        
        results.push({
            "key": "requestType",
            "value": requestType,
            "hidden": true
        });

        // Any page-data
        if (pageData) {
            try { 
                let data = JSON.parse(pageData);
                if (typeof data === "object" && data !== null) {
                    Object.entries(data).forEach(([key, data]) => {
                        let result = super.handleQueryParam(`pd[${key}]`, data);
                        if (result) {
                            results.push(result);
                        }
                    });
                }
            } catch (e) {
                results.push({
                    "key": `pd`,
                    "field": "Page Data",
                    "value": pageData,
                    "group": "general"
                });
            }
        }

        // Any event-data
        if (eventData) {
            try {
                let data = JSON.parse(eventData);
                if (typeof data === "object" && data !== null) {
                    Object.entries(data).forEach(([key, data]) => {
                        if (key === "line_items") {
                            // Line items requires additional parsing
                            if (Array.isArray(data)) {
                                data.forEach((product, i) => {
                                    if (typeof product === "object" && product !== null) {
                                        Object.entries(product).forEach(([productKey, productValue]) => {

                                            // Title case the field name
                                            let field = productKey.replace("product_", "").replace(/_/g, " ").replace(
                                                /\w\S*/g,
                                                (txt) => {
                                                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                                }
                                            ).replace("Id", "ID");

                                            results.push({
                                                "key": `ed[line_items][${i}][${productKey}]`,
                                                "field": `Product ${i + 1} ${field}`,
                                                "value": productValue,
                                                "group": "ecommerce"
                                            });
                                        });
                                    }
                                });
                            }
                        } else {
                            // Everything is (currently) one level
                            let result = super.handleQueryParam(`ed[${key}]`, data);
                            if (result) {
                                results.push(result);
                            }
                        }
                    });
                }
            } catch (e) {
                results.push({
                    "key": `ed`,
                    "field": "Ecommerce Data",
                    "value": eventData,
                    "group": "ecommerce"
                });
            }
        }

        return results;
    }
}