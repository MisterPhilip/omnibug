/* global OmnibugSettings, OmnibugProvider, OmnibugPort */

/**
 * Set/Load/Migrate settings when extension / browser is installed / updated.
 */
chrome.runtime.onInstalled.addListener((details) => {
    let settings = new OmnibugSettings();
    settings.migrate();
});


/**
 * Load settings when storage has changed
 */
chrome.storage.onChanged.addListener((changes, storageType) => {
    const settings = new OmnibugSettings();
    settings.load().then(sendSettingsToTabs);
});

/*
 Persistent(ish) storage of the open tabs
 Not ideal, but the keep alive script should keep this variable in existence
 */
const tabs = {};

// Keep alive funcs
const forceReconnect = (port) => {
    console.log(`Reconnecting port ${port.name} to stay alive`);
    deleteTimer(port);
    port.disconnect();
}
const deleteTimer = (port) => {
    console.log(`Port ${port.name} disconnected`);
    if (port._timer) {
        clearTimeout(port._timer);
        delete port._timer;
        delete tabs[port.name];
    }
}
var providerPattern;

/**
 * Accept incoming connections from our devtools panels
 */
chrome.runtime.onConnect.addListener((port) => {
    console.log(`Port ${port.name} connected`);

    port.onDisconnect.addListener(deleteTimer);
    port._timer = setTimeout(forceReconnect, 250e3, port);
    tabs[port.name] = port;

    const settings = new OmnibugSettings();

    // Ensure the panel has the latest settings
    settings.load().then((loadedSettings) => {
        const data = {
            "event": "settings",
            "data": loadedSettings
        };
        port.postMessage(data);

        // Cache the provider RegExp for slightly better performance
        providerPattern = OmnibugProvider.getPattern(loadedSettings.providers);
    });

    port.onMessage.addListener((messages) => {
        messages.forEach((message) => {
            if (message.type === "settings") {
                if (typeof message.key === "string" && message.value) {
                    settings.updateItem(message.key, message.value);
                } else {
                    settings.save(message.value);
                }
            } else if (message.type === "linkClick" && message.url) {
                chrome.tabs.create({ url: message.url });
            } else if (message.type === "openSettings") {
                chrome.runtime.openOptionsPage();
            }
        });
    })
});

/**
 * Listen for all requests that match our providers
 */
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {

        // Ignore any requests for windows where devtools isn't open, or options requests
       if (!validProviderRequest(details)) { return; }

        let data = {
            "request": {
                "initiator": details.initiator,
                "method": details.method,
                "id": details.requestId,
                "tab": details.tabId,
                "timestamp": details.timeStamp,
                "type": details.type,
                "url": details.url,
                "postData": ""
            },
            "event": "webRequest"
        };

        // Grab any POST data that is included
        if (details.method === "POST" && details.requestBody) {
            if (details.requestBody.raw && details.requestBody.raw[0]) {
                data.request.postData = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes));
            } else if (typeof details.requestBody.formData === "object") {
                data.request.postData = details.requestBody.formData;
            }
        }

        let providerDataArray = OmnibugProvider.parseUrl(data.request.url, data.request.postData);
        if (!Array.isArray(providerDataArray)) {
            providerDataArray = [providerDataArray];
        } else {
            data.multipleEntriesPerRequest = true;
        }

        providerDataArray.forEach(providerData => {
            // Parse the URL and join our request info to the parsed data
            let finalData = Object.assign(
                data,
                providerData
            );
            tabs[details.tabId].postMessage(finalData);
        });

    },
    {  urls: ["<all_urls>"] },
    ["requestBody"]
);

// HTTP 4xx/5xx Errors
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        // Ignore any requests for windows where devtools isn't open, or options requests
        if (!validProviderRequest(details) || details.statusCode < 400) { return; }

        const data = {
            "request": {
                "id": details.requestId,
                "error": details.statusCode,
            },
            "event": "requestError"
        };

        tabs[details.tabId].postMessage(data);
    },
    { urls: ["<all_urls>"]}
);

// Cancelled/blocked requests (other extensions e.g. adblockers, network errors, etc.)
chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
        // Ignore any requests for windows where devtools isn't open, or options requests
        if (!validProviderRequest(details)) { return; }

        const data = {
            "request": {
                "id": details.requestId,
                "error": details.error,
            },
            "event": "requestError"
        };

        tabs[details.tabId].postMessage(data);
    },
    { urls: ["<all_urls>"]}
);

/**
 * Listen for all navigations that occur on a top-level frame
 */
chrome.webNavigation.onCommitted.addListener(
    (details) => {
        if (!tabHasOmnibugOpen(details.tabId) || details.frameId !== 0) { return; }

        const data = {
            "request": {
                "tab": details.tabId,
                "timestamp": details.timeStamp,
                "url": details.url
            },
            "event": "webNavigation"
        };

        tabs[details.tabId].postMessage(data);
    }
);

/**
 * Check request to see if we care about it or not
 * @param details
 * @returns {boolean}
 */
function validProviderRequest(details) {
    if(typeof providerPattern === "undefined" || !(providerPattern instanceof RegExp)) {
        providerPattern = OmnibugProvider.getPattern();
    }
    return details.method !== "OPTIONS" &&
            tabHasOmnibugOpen(details.tabId) &&
            providerPattern.test(details.url) &&
            !/\/.well-known\//i.test(details.url);

}

/**
 * Verify we have a tab that we have devtools open for
 *
 * @param tabId
 * @return {boolean}
 */
function tabHasOmnibugOpen(tabId) {
    return (tabId !== -1 && tabId in tabs);
}

/**
 * Send new settings values to all tabs
 *
 * @param   settings
 */
function sendSettingsToTabs(settings) {
    console.log("Sending settings to tabs", settings);
    Object.values(tabs).forEach((tab) => {
        tab.postMessage({
            "event": "settings",
            "data": settings
        });
    });
    providerPattern = OmnibugProvider.getPattern(settings.providers);
}
