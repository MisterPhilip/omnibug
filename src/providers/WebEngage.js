/**
 * WebEngage
 * https://webengage.com/
 * https://docs.webengage.com/docs/web-sdk-integration
 *
 * Events are sent (usually via sendBeacon) to c.[region.]webengage.com/l4.jpg (l3.jpg for the XHR fallback) as
 * {"data": "<payload>"}, where the payload is an LZ-string compressToBase64'd JSON array of events.
 *
 * @class
 * @extends BaseProvider
 */
class WebEngageProvider extends BaseProvider
{
    constructor()
    {
        super();
        this._key        = "WEBENGAGE";
        this._pattern    = /\/\/c\.(?:[a-z]+\.)?webengage\.com\/l\d+\.jpg/;
        this._name       = "WebEngage";
        this._type       = "customer";
        this._keywords   = ["webengage", "we"];
    }

    /**
     * Retrieve the column mappings for default columns (account, event type)
     *
     * @return {{}}
     */
    get columnMapping()
    {
        return {
            "account":     "omnibug_account",
            "requestType": "requestTypeParsed"
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
                "key": "event",
                "name": "Event Data"
            },
            {
                "key": "user",
                "name": "User"
            },
            {
                "key": "system",
                "name": "System Data"
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
            "event_name": {
                "name": "Event Name",
                "group": "general"
            },
            "category": {
                "name": "Event Category",
                "group": "general"
            },
            "license_code": {
                "name": "License Code",
                "group": "general"
            },
            "event_time": {
                "name": "Event Time",
                "group": "general"
            },
            "x_request_id": {
                "name": "Request ID",
                "group": "general"
            },
            "interface_id": {
                "name": "Interface ID",
                "group": "general"
            },
            "cuid": {
                "name": "Customer ID (cuid)",
                "group": "user"
            },
            "luid": {
                "name": "Anonymous ID (luid)",
                "group": "user"
            },
            "suid": {
                "name": "Session ID (suid)",
                "group": "user"
            }
        };
    }

    /**
     * Parse any POST data into param key/value pairs
     *
     * @param postData
     * @return {Array|Object}
     */
    parsePostData(postData = "")
    {
        let encoded = "";
        if(typeof postData === "object" && postData) {
            // Form data, e.g. the l3.jpg XHR fallback
            encoded = Array.isArray(postData.data) ? postData.data[0] : postData.data;
        } else if(typeof postData === "string" && postData.indexOf("data=") === 0) {
            encoded = decodeURIComponent(postData.slice(5).replace(/\+/g, " "));
        } else if(typeof postData === "string" && postData) {
            try {
                encoded = JSON.parse(postData).data;
            } catch(e) {
                return super.parsePostData(postData);
            }
        }
        if(typeof encoded !== "string" || !encoded) {
            return [];
        }

        let events;
        try {
            events = this.decodeTransit(JSON.parse(this.decompressFromBase64(encoded)));
        } catch(e) {
            console.error("Unable to decode WebEngage payload", e.message);
            return [["data", encoded]];
        }

        // Most requests carry a single event, so drop the "[0]." prefix in that case
        if(Array.isArray(events) && events.length === 1) {
            events = events[0];
        }
        return super.parsePostData(JSON.stringify(events));
    }

    /**
     * Parse a given URL parameter into human-readable form
     *
     * @param {string}  name
     * @param {string}  value
     * @returns {{}}
     */
    handleQueryParam(name, value)
    {
        const [, index = "", key] = name.match(/^(\[\d+\]\.)?(.*)$/),
            nested = key.match(/^(event_data|system_data)\.(.+)$/);
        if(nested) {
            return {
                "key":   name,
                "field": index + nested[2],
                "value": value,
                "group": nested[1] === "event_data" ? "event" : "system"
            };
        }

        const param = this.keys[key];
        if(param) {
            return {
                "key":   name,
                "field": index + param.name,
                "value": value,
                "group": param.group
            };
        }
        return super.handleQueryParam(name, value);
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
            eventNames = [],
            licenseCode = "";

        params.forEach((value, key) => {
            if(/^(?:\[\d+\]\.)?event_name$/.test(key)) {
                eventNames.push(value);
            } else if(!licenseCode && /^(?:\[\d+\]\.)?license_code$/.test(key)) {
                licenseCode = value;
            }
        });

        if(licenseCode) {
            results.push({
                "key":    "omnibug_account",
                "value":  licenseCode,
                "hidden": true
            });
        }

        results.push({
            "key":    "requestTypeParsed",
            "value":  eventNames.length ? ((eventNames.length > 1) ? `(${eventNames.length}) ` : "") + eventNames.join(", ") : "Other",
            "hidden": true
        });

        return results;
    }

    /**
     * Undo WebEngage's transit encoding: "~t<ISO date>" for dates, and "~~" to escape a leading "~"
     *
     * @param {*} value
     *
     * @returns {*}
     */
    decodeTransit(value)
    {
        if(typeof value === "string") {
            if(value.indexOf("~t") === 0) {
                return value.slice(2);
            }
            return value.indexOf("~~") === 0 ? value.slice(1) : value;
        }
        if(Array.isArray(value)) {
            return value.map((item) => this.decodeTransit(item));
        }
        if(value && typeof value === "object") {
            return Object.keys(value).reduce((decoded, key) => {
                decoded[this.decodeTransit(key)] = this.decodeTransit(value[key]);
                return decoded;
            }, {});
        }
        return value;
    }

    /**
     * LZ-string decompressFromBase64 (https://github.com/pieroxy/lz-string, MIT), which WebEngage uses to encode events
     *
     * @param {string} input
     *
     * @returns {string}
     */
    decompressFromBase64(input)
    {
        const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        input = input.replace(/[^A-Za-z0-9+/=]/g, "");
        if(!input) {
            return "";
        }

        let position = 32,
            index = 0,
            val = keyStr.indexOf(input.charAt(index++));
        const readBits = (count) => {
            let bits = 0;
            for(let power = 1; power !== (1 << count); power <<= 1) {
                const bit = val & position;
                position >>= 1;
                if(position === 0) {
                    position = 32;
                    val = keyStr.indexOf(input.charAt(index++));
                }
                bits |= (bit > 0 ? 1 : 0) * power;
            }
            return bits;
        };

        let dictionary = [0, 1, 2],
            enlargeIn = 4,
            dictSize = 4,
            numBits = 3,
            result = [],
            entry, w, c;

        switch(readBits(2)) {
            case 0:
                c = String.fromCharCode(readBits(8));
                break;
            case 1:
                c = String.fromCharCode(readBits(16));
                break;
            default:
                return "";
        }
        dictionary[3] = c;
        w = c;
        result.push(c);

        for(;;) {
            if(index > input.length) {
                return "";
            }
            c = readBits(numBits);
            if(c === 0 || c === 1) {
                dictionary[dictSize++] = String.fromCharCode(readBits(c === 0 ? 8 : 16));
                c = dictSize - 1;
                enlargeIn--;
            } else if(c === 2) {
                return result.join("");
            }
            if(enlargeIn === 0) {
                enlargeIn = 1 << numBits;
                numBits++;
            }

            if(dictionary[c]) {
                entry = dictionary[c];
            } else if(c === dictSize) {
                entry = w + w.charAt(0);
            } else {
                return "";
            }
            result.push(entry);

            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if(enlargeIn === 0) {
                enlargeIn = 1 << numBits;
                numBits++;
            }
        }
    }
}
