/**
 * Omnibug Provider Factory
 *
 * @type {{addProvider, getProviders, checkUrl, getProviderForUrl, parseUrl, defaultPattern}}
 */
/* exported OmnibugProvider */
var OmnibugProvider = (function() {

    var providers = {},
        defaultPattern = [],
        defaultPatternRegex = new RegExp();

    /**
     * Return the provider for a specified url
     *
     * @param url
     *
     * @returns {typeof BaseProvider}
     */
    let getProviderForUrl = (url) => {
        for(let provider in providers) {
            if (Object.prototype.hasOwnProperty.call(providers, provider) && providers[provider].checkUrl(url)) {
                return providers[provider];
            }
        }
        return new BaseProvider();
    };

    return {

        /**
         * Add a new provider
         *
         * @param {typeof BaseProvider} provider
         */
        "addProvider": (provider) => {
            providers[provider.key] = provider;
            defaultPattern.push(provider.pattern);
            defaultPatternRegex = new RegExp(defaultPattern.map((el) => {
                return el.source;
            }).join("|"));
        },

        /**
         * Returns a list of all added providers
         *
         * @returns {{}}
         */
        "getProviders": () => {
            return providers;
        },

        /**
         * Checks if a URL should be parsed or not
         *
         * @param {string}  url   URL to check against
         *
         * @returns {boolean}
         */
        "checkUrl": (url) => {
            return defaultPatternRegex.test(url);
        },

        /**
         * Return the provider for a specified url
         *
         * @param url
         *
         * @returns {typeof BaseProvider}
         */
        "getProviderForUrl": getProviderForUrl,

        /**
         * Parse a URL into a JSON object
         *
         * @param {string}  url         URL to be parsed
         * @param {string}  postData    POST data, if applicable
         *
         * @returns {{provider, data}}
         */
        "parseUrl": (url, postData = "") => {
            return getProviderForUrl(url).parseUrl(url, postData);
        },

        /**
         * Return the patterns for all (enabled) providers
         *
         * @param   {void|{}}  providerInfo    Providers that are disabled
         *
         * @returns {RegExp}
         */
        "getPattern": (providerInfo = {}) => {
            let patterns = [];
            Object.keys(providers).forEach((provider) => {
                if(typeof providerInfo[provider] === "undefined" || providerInfo[provider].enabled) {
                    patterns.push(providers[provider].pattern.source);
                }
            });
            return new RegExp(patterns.join("|"), "i");
        }
    };
})();