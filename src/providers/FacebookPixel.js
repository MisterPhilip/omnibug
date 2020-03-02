/**
 * Facebook Pixel
 * https://developers.facebook.com/docs/facebook-pixel
 *
 * @class
 * @extends BaseProvider
 */
class FacebookPixelProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "FACEBOOKPIXEL";
        this._pattern    = /facebook\.com\/tr\/?(?!.*&ev=microdata)\?/i;
        this._name       = "Facebook Pixel";
        this._type       = "marketing";
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":      "id",
            "requestType":  "requestType"
        };
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
                "name": "General"
            },
            {
                "key": "custom",
                "name": "Event Data"
            },
            {
                "key": "products",
                "name": "Products"
            }
        ];
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {
            "id": {
                "name": "Account ID",
                "group": "general"
            },
            "ev": {
                "name": "Event Type",
                "group": "general"
            },
            "dl": {
                "name": "Page URL",
                "group": "general"
            },
            "rl": {
                "name": "Referring URL",
                "group": "general"
            },
            "ts": {
                "name": "Timestamp",
                "group": "general"
            },
            "sw": {
                "name": "Screen Width",
                "group": "other"
            },
            "sh": {
                "name": "Screen Height",
                "group": "other"
            },
            "v": {
                "name": "Pixel Version",
                "group": "other"
            },
            "ec": {
                "name": "Event Count",
                "group": "other"
            },
            "if": {
                "name": "In an iFrame",
                "group": "other"
            },
            "it": {
                "name": "Initialized Timestamp",
                "group": "other"
            },
            "r": {
                "name": "Code Branch",
                "group": "other"
            },
            "cd[content_name]": {
                "name": "Content Name",
                "group": "custom"
            },
            "cd[content_category]": {
                "name": "Content Category",
                "group": "custom"
            },
            "cd[content_ids]": {
                "name": "Product IDs",
                "group": "products"
            },
            "cd[content_type]": {
                "name": "Content Type",
                "group": "custom"
            },
            "cd[num_items]": {
                "name": "Quantity",
                "group": "custom"
            },
            "cd[search_string]": {
                "name": "Search Keyword",
                "group": "custom"
            },
            "cd[status]": {
                "name": "Registration Status",
                "group": "custom"
            },
            "cd[value]": {
                "name": "Value",
                "group": "custom"
            },
            "cd[currency]": {
                "name": "Currency",
                "group": "custom"
            },
            "ud[uid]": {
                "name": "User ID",
                "group": "general"
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
        if(name === "cd[contents]") {
            // do handling in custom
        } else if(!this.keys[name] && name.indexOf("cd[") === 0) {
            result = {
                "key":   name,
                "field": name.replace(/^cd\[|\]$/g, ""),
                "value": value,
                "group": "custom"
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
    handleCustom(url, params)
    {
        let results = [],
            content = params.get("cd[contents]"),
            requestType = params.get("ev") || "";
        if(content) {
            try {
                let jsonData = JSON.parse(content);
                if(jsonData && jsonData.length) {
                    let keyMapping = {
                        "id": "ID",
                        "item_price": "Price",
                        "quantity": "Quantity"
                    };
                    jsonData.forEach((product, index) => {
                        Object.entries(product).forEach(([key, value]) => {
                            results.push({
                                "key": `cd[contents][${index}][${key}]`,
                                "field": `Product ${index+1} ${keyMapping[key] || key}`,
                                "value": value,
                                "group": "products"
                            });
                        });
                    });
                }
            } catch(e) {
                results.push({
                    "key": "cd[contents]",
                    "field": "Content",
                    "value": content,
                    "group": "products"
                });
            }
        }

        results.push({
            "key":   "requestType",
            "value": requestType.split(/(?=[A-Z])/).join(" "),
            "hidden": true
        });
        return results;
    }
}