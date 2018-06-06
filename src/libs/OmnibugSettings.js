/**
 * Omnibug Settings
 */
/* exported OmnibugSettings */
class OmnibugSettings
{
    /**
     * Get the current storage type
     *
     * @return {string}
     */
    get storage_type()
    {
        return (browser.storage.sync) ? "sync" : "local";
    }

    get storage_key()
    {
        return "##OMNIBUG_KEY##";
    }

    /**
     * Get default setting values
     *
     * @return {{defaultPattern: string, enabledProviders: string[], highlightKeys: string[], alwaysExpand: boolean, showQuotes: boolean, showRedirects: boolean, showFullNames: boolean, color_load: string, color_click: string, color_prev: string, color_quotes: string, color_hilite: string, color_redirect: string, color_hover: string}}
     */
    get defaults()
    {
        return  {
            // pattern to match in request url
            defaultPattern : OmnibugProvider.getPattern().source,

            // all providers (initially)
            enabledProviders : Object.keys( OmnibugProvider.getProviders() ).sort(),

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
     * @return {Promise<*>}
     */
    load()
    {
        return browser.storage[this.storage_type].get(this.storage_key).then((settings) => {
            return Object.assign(this.defaults, settings[this.storage_key]);
        }, () => {
            return this.defaults;
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
        browser.storage[this.storage_type].set(settings);

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
        // Verify the user can be migrated to sync storage
        if(this.storage_type !== "sync") {
            return this.load();
        }

        // Check if we have anything already in the sync storage
        // Values may already exist if the user has updated another one of their browsers but not this one
        return browser.storage.sync.get(this.storage_key).then((syncSettings) => {

            // If we already have sync data, let's use that - since that version of the extension is most up-top-date
            if(syncSettings[this.storage_key]) {
                return Object.assign(this.defaults, syncSettings[this.storage_key]);
            }

            // Nothing in the sync storage, check local for any data we should push to sync
            return browser.storage.local.get(this.storage_key).then((localSettings) => {
                return Object.assign(this.defaults, localSettings[this.storage_key] || {});
            }).catch((error) => {
                // Something bad happened, just return the defaults as a fail-safe
                console.error("Migration error from local:", error);
                return this.defaults;
            });

        }).then((settings) => {

            // Save whatever settings we get back (either sync or local)
            return this.save(settings);

        }).catch((error) => {

            // Something bad happened, just return the defaults as a fail-safe
            console.error("Migration error:", error);
            return this.save();

        });
    }
}