/**
 * Omnibug Settings
 */
/* exported OmnibugSettings */
class OmnibugSettings
{
    /**
     * OmnibugSettings
     */
    constructor()
    {
        this.browser = chrome;
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
        let providers = {};
        Object.keys(OmnibugProvider.getProviders()).forEach((provider) => {
            providers[provider] = {"enabled": true};
        });

        return {
            // pattern to match in request url
            defaultPattern : OmnibugProvider.getPattern().source,

            // all providers (initially)
            providers : providers,

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

            // Theme
            theme: "auto",

            // Migration version
            migrationIndex: 0,

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
                try {
                    if(typeof settings[this.storage_key] === "object") {
                        if (typeof settings[this.storage_key].providers !== "object") {
                            settings[this.storage_key].providers = this.defaults.providers;
                        } else {
                            Object.keys(this.defaults.providers).forEach((key) => {
                                settings[this.storage_key].providers[key] = Object.assign(this.defaults.providers[key], settings[this.storage_key].providers[key]);
                            });
                        }
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    return resolve(Object.assign(this.defaults, settings[this.storage_key]));
                }
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
     * Save a single setting to the browser's storage
     *
     * @param key
     * @param value
     *
     * @return {Promise<*>}
     */
    updateItem(key, value)
    {
        return this.load().then((settings) => {
            settings[key] = value;
            return this.save(settings);
        });
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
            if(typeof settings.enabledProviders === "object" && settings.migrationIndex < 1) {
                let allProviders = Object.keys(OmnibugProvider.getProviders()),
                    providers = {};
                allProviders.forEach((provider) => {
                    providers[provider] = {
                        "enabled": settings.enabledProviders.includes(provider)
                    };
                });
                // We'll remove this later, in case anything goes wrong in the migration phase:
                /* delete settings.enabledProviders; */
                settings.providers = providers;
                settings.migrationIndex = 1;
            }
            return this.save(settings);
        });
    }
}