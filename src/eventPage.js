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
     * Events that need listeners:
     *
     * Existing...
     * + browser.runtime.onInstalled:           when the extension is installed, updated, or chrome update
     * + browser.runtime.onStartup:             when the extension first runs
     * + browser.storage.onChanged:             when the settings are updated
     * + browser.runtime.onConnect:             when a devtools panel is opened
     * - browser.webRequest.onBeforeRequest:    when a network request is made
     *
     * @TODO (or at least consider) adding these:
     * - browser.webNavigation.onBeforeNavigate:    when a user navigates to a new page (clear/fade previous requests)
     * - browser.webRequest.onHeadersReceived:      when a request's headers are returned (useful for seeing 3XX requests)
     */

    /**
     * Set/Load/Migrate settings when extension / browser is installed / updated.
     */
    browser.runtime.onInstalled.addListener((details) => {
        // Migrate from local storage to sync storage, if available
        if(details.reason === "update" && details.previousVersion.indexOf("0.") === 0)
        {
            settings.migrate().then((loadedSettings) => {
                cached.settings = loadedSettings;
                cached.pattern = OmnibugProvider.getPattern(loadedSettings.enabledProviders);
            });
        } else {
            settings.load().then((loadedSettings) => {
                cached.settings = loadedSettings;
                cached.pattern = OmnibugProvider.getPattern(loadedSettings.enabledProviders);

                // Make sure we save any settings, in case of fresh installs
                settings.save(settings);
            });
        }
    });

    /**
     * Load settings when extension is first run a session
     */
    browser.runtime.onStartup.addListener(() => {
        settings.load().then((loadedSettings) => {
            cached.settings = loadedSettings;
            cached.pattern = OmnibugProvider.getPattern(cached.settings.enabledProviders);
        });
    });

    /**
     * Load settings when storage has changed
     */
    browser.storage.onChanged.addListener((changes, storageType) => {
        if(OmnibugSettings.storage_key in changes)
        {
            cached.settings = changes[OmnibugSettings.storage_key];
            cached.pattern = OmnibugProvider.getPattern(cached.settings.enabledProviders);
            sendToAllDevTools( { "type" : "prefs", "payload" : cached.settings } );
        }
    });

    /**
     * Accept incoming connections from our devtools panels
     */
    browser.runtime.onConnect.addListener((details) => {
        console.log("browser.runtime.onConnect", details);
        let port = new OmnibugPort(details);
        if(!port.belongsToOmnibug)
        {
            return;
        }
        tabs = port.init(tabs);
    });

    browser.webRequest.onBeforeRequest.addListener(
        (details) => {
            // Ignore any requests for windows where devtools isn't open
            if(details.tabId === -1 || !(details.tabId in tabs))
            {
                return;
            }

            if(!cached.pattern.test(details.url))
            {
                // Does not match any enabled providers
                return;
            }

            let postData = "";
            if(details.method === "POST") {
                postData =  String.fromCharCode.apply( null, new Uint8Array( data.requestBody.raw[0].bytes ) );
            }

            /**
             * Data needed to send to devpanel:
             *
             * - event
             * - request
             *  - ID
             *  - URL
             *  - timestamp
             */
            let data = OmnibugProvider.parseUrl(details.url, postData);

            data.event = "webRequest";
            console.log("MATCH", details);
            console.log(data);

        },
        { urls: ["<all_urls>"] },
        ["requestBody"]
    );

    return;


    var beforeRequestCallback = function( details ) {
        console.log('eventPage beforeRequestCallback', details.url);

        // ignore browser:// requests and non-metrics URLs
        if( details.tabId === -1 || !shouldProcess( details.url ) ) {
            return;
        }

        if( !( details.tabId in tabs ) ) {
            return;
        }

        console.log('eventPage beforeRequestCallback MATCH', details);

        // look up provider and pass along
        var prov = OmnibugProvider.getProviderForUrl( details.url );
        details.omnibugProvider = prov;

        // store the current tab's loading state into the details object
        details.omnibugLoading = tabs[details.tabId].loading;

        console.log('eventPage beforeRequestCallback MATCH AFTER', details);

        browser.tabs.get( details.tabId).then((tab) => {detailsProcessingCallbackFactory(details, tab)});
    };

    return;


    /**
     * Return a pattern that matches the currently enabled providers
     *
     * @param {{}}  prefSet Preferences object
     *
     * @return {RegExp}
     */
    function getCurrentPattern( prefSet ) {
        return OmnibugProvider.getPattern(prefSet.enabledProviders);
    }

    /**
     * Quickly determine if a URL is a candidate for us or not
     *
     * @param {string} url  A URL to check against
     *
     * @return {Boolean}
     */
    function shouldProcess( url ) {
        return this.prefs.defaultRegex.test( url );
    }

    /**
     * Callback for the onResponseStarted listener
     *
     * details object:
     *   frameId: 0
     *   fromCache: false
     *   ip: "69.171.246.16"
     *   method: "GET"
     *   parentFrameId: -1
     *   requestId: "7502"
     *   statusCode: 200
     *   statusLine: "HTTP/1.1 200 OK"
     *   tabId: 2
     *   timeStamp: 1365937790837.5398
     *   type: "xmlhttprequest"
     *   url: "https://0-act.channel.facebook.com/pull?cha...
     */
    var beforeRequestCallback = function( details ) {
        console.log('eventPage beforeRequestCallback', details.url);

        // ignore browser:// requests and non-metrics URLs
        if( details.tabId === -1 || !shouldProcess( details.url ) ) {
            return;
        }

        if( !( details.tabId in tabs ) ) {
            return;
        }

        console.log('eventPage beforeRequestCallback MATCH', details);

        // look up provider and pass along
        var prov = OmnibugProvider.getProviderForUrl( details.url );
        details.omnibugProvider = prov;

        // store the current tab's loading state into the details object
        details.omnibugLoading = tabs[details.tabId].loading;

        console.log('eventPage beforeRequestCallback MATCH AFTER', details);

        browser.tabs.get( details.tabId).then((tab) => {detailsProcessingCallbackFactory(details, tab)});
    };

    /**
     * Factory function returning a function which has access to details *and* tab
     */
    var detailsProcessingCallbackFactory = function( details, tab ) {
        console.log('eventPage detailsProcessingCallbackFactory', details, tab);
        // save the tab's current URL into the details object
        details.tabUrl = tab.url;

        sendToDevToolsForTab( details.tabId, { "type" : "webEvent", "payload" : decodeUrl( details ) } );

    };

    browser.webRequest.onBeforeRequest.addListener(
        beforeRequestCallback,
        { urls: ["<all_urls>"] },
        ['requestBody']
        // @TODO: filter these based on static patterns/config ?
    );
    /**
     * Send a message to the devtools panel on a given tab
     * Assumes the port is already connected
     */
    function sendToDevToolsForTab( tabId, object ) {
        console.debug( "sending ", object.type, " message to tabId: ", tabId, ": ", object );
        console.log(tabs[tabId].port.postMessage);
        try {
            var payload = JSON.parse(JSON.stringify(object));
            tabs[tabId].port.postMessage( payload );
        } catch( ex ) {
            console.error( "error calling postMessage: ", ex.message );
        }
    }

    /**
     * Send a message to all connected devtools panels
     */
    function sendToAllDevTools( object ) {
        Object.keys( tabs ).forEach( function( tabId ) {
            sendToDevToolsForTab( tabId, object );
        } );
    }

    /**
     * Augments the data object with summary data
     * @param data the data object
     * @return the augmented data object
     */
    function augmentData( data ) {
        data["omnibug"] = {};

        var eventType = ( data.state.omnibugLoading ? "load" : "click" ),
            url = data.state.url;

        // hacky: sometimes load events are being reported as click events.  For Omniture, detect
        // the event type (pe= means a click event), and reset eventType accordingly.
        // @TODO: Move this logic to the providers
        if( data.state.omnibugProvider.key.toUpperCase() === "OMNITURE" ) {
            var oldEventType = eventType;
            eventType = ( !!url.match( "[?&]pe=" ) ? "click" : "load" );
        }

        data.omnibug["Event"]       = eventType;
        data.omnibug["Timestamp"]   = data.state.timeStamp;
        data.omnibug["Provider"]    = data.state.omnibugProvider.name;
        data.omnibug["Parent URL"]  = data.state.tabUrl;
        data.omnibug["Full URL"]    = data.state.url;
        data.omnibug["Request ID"]   = data.state.requestId;
        data.omnibug["Status Line"]  = data.state.statusLine;
        data.omnibug["Request Type"] = data.state.type;
        data.omnibug["Method"]       = data.state.method;

        return data;
    }

    // public
    return {};

})();