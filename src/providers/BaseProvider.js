/**
 * Generic Base Provider
 *
 * @class
 */
class BaseProvider
{
    constructor()
    {
        this._key        = '';
        this._pattern    = /.*/;
        this._name       = '';
        this._type       = '';
    }

    /**
     * Get the Provider's key
     *
     * @returns {string}
     */
    get key()
    {
        return this._key;
    }

    /**
     * Get the Provider's type
     *
     * @returns {string}
     */
    get type()
    {
        let types = {
            "analytics":    "Analytics",
            "testing":      "UX Testing",
            "tagmanager":   "Tag Manager"
        };
        return types[this._type] || "Unknown";
    }

    /**
     * Get the Provider's RegExp pattern
     *
     * @returns {RegExp}
     */
    get pattern()
    {
        return this._pattern;
    }

    /**
     * Get the Provider's name
     *
     * @returns {string}
     */
    get name()
    {
        return this._name;
    }

    /**
     * Get all of the available URL parameter keys
     *
     * @returns {{}}
     */
    get keys()
    {
        return {};
    }

    /**
     * Check if this provider should parse the given URL
     *
     * @param {string}  rawUrl   A URL to check against
     *
     * @returns {Boolean}
     */
    checkUrl(rawUrl)
    {
        return this.pattern.test(rawUrl);
    }

    /**
     * Parse a given URL into human-readable output
     *
     * @param {string}  rawUrl   A URL to check against
     *
     * @returns {{}}}
     */
    parseUrl(rawUrl)
    {
        let url = new URL(rawUrl),
            data = [];

        for(let param of url.searchParams)
        {
            let key = param[0],
                value = param[1];

            data.push(this.handleQueryParam(key, value));
        }

        let customData = this.handleCustom(url);
        if(typeof customData === 'object' && customData !== null)
        {
            if(customData.length) {
                data = data.concat(customData);
            } else {
                data.push(customData);
            }
        }

        return {
            "provider": {
                "name": this.name,
                "key":  this.key,
                "type": this.type
            },
            "data": data
        };
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
        let param = this.keys[name] || {};
        return {
            "key":   name,
            "field": param.name || name,
            "value": value,
            "group": param.group || "Other"
        }
    }

    /**
     * Parse custom properties for a given URL
     *
     * @param {string} url
     *
     * @returns {Array}
     */
    handleCustom(url)
    {

    }
}