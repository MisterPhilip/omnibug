/**
 * Omnibug Settings
 */
/* exported OmnibugSettings */
class OmnibugSettings
{
    /**
     * OmnibugSettings
     *
     * @param forcedBrowser force a browser object (great for testing)
     */
    constructor(forcedBrowser = null)
    {
        if(forcedBrowser !== null) {
            this.browser = forcedBrowser;
        } else if(typeof chrome === "object") {
            this.browser = chrome;
        } else {
            throw new TypeError("Browser is missing");
        }
    }

    /**
     * Get the current storage type
     *
     * @return {string}
     */
    get storage_type()
    {
        return (this.browser.storage.sync) ? "sync" : "local";
    }

    get storage_key()
    {
        return "##OMNIBUG_KEY##";
    }

    /**
     * Get default setting values
     *
     * @return {{defaultPattern: string, disabledProviders: string[], highlightKeys: string[], alwaysExpand: boolean, showQuotes: boolean, showRedirects: boolean, showFullNames: boolean, color_load: string, color_click: string, color_prev: string, color_quotes: string, color_hilite: string, color_redirect: string, color_hover: string}}
     */
    get defaults()
    {
        return {
            // pattern to match in request url
            defaultPattern : OmnibugProvider.getPattern().source,

            // all providers (initially)
            disabledProviders : [],

            // keys to highlight
            highlightKeys  : ["pageName", "ch", "events", "products"],

            // show entries expanded?
            alwaysExpand : false,

            // surround values with quotes?
            showQuotes : true,

            // show redirected entries?
            showRedirects : true,

            // show full variable names?
            showFullNames : true,

            // show navigation requests
            showNavigation: true,

            // Toggle text wrapping
            wrapText: true,

            // Allow note taking (used for exports)
            showNotes: false,

            // Should newest or oldest entries show first?
            requestSortOrder: "asc",

            // Allow tracking?
            allowTracking: true,

            // colors
            color_load        : "#dbedff",
            color_click       : "#f1ffdb",
            color_quotes      : "#ff0000",
            color_highlight   : "#ffff00",
            color_redirect    : "#eeeeee",
            color_hover       : "#cccccc"
        };
    }

    /**
     * Load settings from the browser's storage (local or sync)
     *
     * @returns {Promise}
     */
    load()
    {
        return new Promise((resolve, reject) => {
            this.browser.storage[this.storage_type].get(this.storage_key, (settings) => {
                return resolve(Object.assign(this.defaults, settings[this.storage_key]));
            });
        });
    }

    /**
     * Save new settings to the browser's storage (local or sync)
     *
     * @param newSettings
     * @return {{}}}
     */
    save(newSettings = {})
    {
        let settings = {};
        settings[this.storage_key] = Object.assign(this.defaults, newSettings);
        this.browser.storage[this.storage_type].set(settings);

        // Return the merged settings object
        return settings[this.storage_key];
    }

    /**
     * Restore all default values, alias to `save()`
     *
     * @return {{}}}
     */
    restoreDefaults()
    {
        return this.save();
    }

    /**
     * Migrate settings from local to sync (for fresh/update installs)
     *
     * @return {Promise<*>}
     */
    migrate()
    {
        return this.load().then((settings) => {
            if(settings.enabledProviders) {
                let allProviders = Object.keys(OmnibugProvider.getProviders()),
                    disabledProviders = [];
                allProviders.forEach((provider) => {
                    if(settings.enabledProviders.indexOf(provider.key) === -1) {
                        disabledProviders.push(provider.key);
                    }
                });
                delete settings.enabledProviders;
                settings.disabledProviders = disabledProviders;
                this.save(settings);
            }
            return settings;
        });
    }
}