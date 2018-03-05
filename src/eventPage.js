/*
 * Omnibug
 * Persistent event page, running in background (controller)
 *
 * https://omnibug.io
 */
(() => {
    let settings = new OmnibugSettings(),
        tabs = {},
        cached = {
            settings: {},
            pattern: null
        };

    /**
     * Set/Load/Migrate settings when extension / browser is installed / updated.
     */
    browser.runtime.onInstalled.addListener((details) => {
        // Migrate from local storage to sync storage, if available
        if(details.reason === "update" && details.previousVersion.indexOf("0.") === 0)
        {
            settings.migrate().then(setCachedSettings);
        } else {
            settings.load().then(setCachedSettings).then((settings) => {
                // Make sure we save any settings, in case of fresh installs
                settings.save(settings);
            });
        }
    });

    /**
     * Load settings when extension is first run a session
     */
    browser.runtime.onStartup.addListener(() => {
        console.log("browser.runtime.onStartup");
        settings.load().then(setCachedSettings);
    });

    /**
     * Load settings when storage has changed
     */
    browser.storage.onChanged.addListener((changes, storageType) => {
        if(settings.storage_key in changes) {
            setCachedSettings(changes[settings.storage_key].newValue);
        }
        sendSettingsToTabs(tabs);
    });

    /**
     * Accept incoming connections from our devtools panels
     */
    browser.runtime.onConnect.addListener((details) => {
        console.log("browser.runtime.onConnect", details);
        if(!cached.pattern) {
            settings.load().then(setCachedSettings);
        }
        let port = new OmnibugPort(details);
        if(!port.belongsToOmnibug)
        {
            return;
        }
        let tabList = {};
        tabList[port.id] = port;
        sendSettingsToTabs(tabList);
        tabs = port.init(tabs);
    });

    /**
     * Listen for all requests that match our providers
     */
    browser.webRequest.onBeforeRequest.addListener(
        (details) => {
            // Ignore any requests for windows where devtools isn't open
            if(!isValidTab(details.tabId) || !cached.pattern.test(details.url))
            {
                return;
            }

            let data = {
                    "request": {
                        "initiator": details.initiator,
                        "method":    details.method,
                        "id":        details.requestId,
                        "tab":       details.tabId,
                        "timestamp": details.timeStamp,
                        "type":      details.type,
                        "url":       details.url
                    },
                    "event": "webRequest"
                },
                postData = "";

            if(details.method === "POST") {
                postData =  String.fromCharCode.apply( null, new Uint8Array( data.requestBody.raw[0].bytes ) );
            }

            data = Object.assign(
                data,
                OmnibugProvider.parseUrl(details.url, postData)
            );

            console.log("Matched URL, sending data to devtools", data);
            tabs[details.tabId].port.postMessage(data);
        },
        { urls: ["<all_urls>"] },
        ["requestBody"]
    );

    /**
     * Listen for all navigations that occur on a top-level frame
     */
    browser.webNavigation.onBeforeNavigate.addListener(
        (details) => {
            if(isValidTab(details.tabId) && details.frameId === 0) {
                // We have a page load within a tab we care about, send a message to the devtools with the info
                console.log("webNavigation.onBeforeNavigate called", details);
                tabs[details.tabId].port.postMessage({
                    "request": {
                        "tab":       details.tabId,
                        "timestamp": details.timeStamp,
                        "url":       details.url
                    },
                    "event": "webNavigation"
                });
            }
        }
    );

    /**
     * Verify we have a tab that we have devtools open for
     *
     * @param tabId
     * @return {boolean}
     */
    function isValidTab(tabId) {
        return (tabId !== -1 && tabId in tabs);
    }

    /**
     * Send new settings values to all tabs
     *
     * @param tabs
     */
    function sendSettingsToTabs(tabs) {
        console.log("Sending settings to tabs", cached.settings);
        Object.values(tabs).forEach((tab) => {
            tab.port.postMessage({
                "event": "settings",
                "data":  cached.settings
            });
        });
    }

    /**
     * Set cached settings
     *
     * @param settings
     * @return {{}}
     */
    function setCachedSettings(settings) {
        cached.settings = settings;
        cached.pattern = OmnibugProvider.getPattern(cached.settings.enabledProviders);
        return cached.settings;
    }

    /**
     * @TODO (or at least consider) adding these:
     * - browser.webRequest.onHeadersReceived:      when a request's headers are returned (useful for seeing 3XX requests)
     */
})();