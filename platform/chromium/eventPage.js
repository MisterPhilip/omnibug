/*
 * Omnibug
 * Persistent event page, running in background (controller)
 *
 * https://omnibug.io
 */

(function() {
    var prefs,
        tabs = {},
        that = this;

    /**
     * Installation callback
     */
    function onInit() {
        console.debug( 'eventPage onInit' );
        initPrefs();
    }
    browser.runtime.onInstalled.addListener( onInit );

    /**
     * Store preferences (on extension installation)
     */
    function initPrefs() {
        console.log('eventPage initPrefs');
        var prefs = {
            // pattern to match in request url
            defaultPattern : OmnibugProvider.getDefaultPattern().source

            // all providers (initially)
            , enabledProviders : Object.keys( OmnibugProvider.getProviders() ).sort()

            // keys to highlight
            , highlightKeys  : [ "pageName", "ch", "events", "products" ]

            // show entries expanded?
            , alwaysExpand : false

            // surround values with quotes?
            , showQuotes : true

            // show redirected entries?
            , showRedirects : false

            // show full variable names?
            , showFullNames : true

            // colors
            , color_load    : "dbedff"
            , color_click   : "f1ffdb"
            , color_prev    : "ffd5de"
            , color_quotes  : "ff0000"
            , color_hilite  : "ffff00"
            , color_redirect: "eeeeee"
            , color_hover   : "cccccc"
        };

        browser.storage.local.set( { "omnibug" : prefs });

        // force a (re)load of prefs, now that they may have changed
        loadPrefsFromStorage( "initPrefs" );
    }

    /**
     * Browser startup callback
     */
    browser.runtime.onStartup.addListener( function() {
        console.log('eventPage browser.runtime.onStartup');
        loadPrefsFromStorage( "onStartup" );
    } );

    /**
     * Grab prefs data from storage
     */
    function loadPrefsFromStorage( whence ) {
        console.log('eventPage loadPrefsFromStorage', whence);
        chrome.storage.local.get("omnibug", (prefData) => {
            that.prefs = prefData.omnibug;

            var pattern = that.prefs.defaultPattern = getCurrentPattern( prefData.omnibug );
            that.prefs.defaultRegex = new RegExp( that.prefs.defaultPattern );

            console.log('this.prefs.defaultRegex', that.prefs.defaultPattern);
        });
    }

    /**
     * Receive updates when prefs change and broadcast them out
     */
    browser.storage.onChanged.addListener( function( changes, namespace ) {
        console.log('eventPage browser.storage.onChanged');
        if( "omnibug" in changes ) {
            var newPrefs = changes["omnibug"].newValue;
            console.log( "Received updated prefs", newPrefs );

            // update local (eventPage.js) prefs
            that.prefs = newPrefs;

            var newPattern = that.prefs.defaultPattern = getCurrentPattern( newPrefs );
            that.prefs.defaultRegex = new RegExp( that.prefs.defaultPattern );

            // send new prefs to all connected devtools panels
            sendToAllDevTools( { "type" : "prefs", "payload" : that.prefs } );
        }
    } );

    /**
     * Return a pattern that matches the currently enabled providers
     */
    function getCurrentPattern( prefSet ) {
        var that = this,
            patterns = [],
            providerPatterns = OmnibugProvider.getPatterns();

        Object.keys( providerPatterns ).forEach( function( provider ) {
            var enabled = prefSet.enabledProviders.indexOf( provider ) > -1;
            if( enabled ) {
                patterns.push( providerPatterns[provider] );
            }
        } );
        return new RegExp( patterns.join( "|" ) ).source;
    }

    /**
     * Quickly determine if a URL is a candidate for us or not
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
     * Return the tabId associated with a port
     */
    function getTabId( port ) {
        return port.name.substring( port.name.indexOf( "-" ) + 1 );
    }

    /**
     * Accept connections from our devtools panels
     */
    browser.runtime.onConnect.addListener( function( port ) {
        if( port.name.indexOf( "omnibug-" ) !== 0 ) return;
        console.debug( "Registered port ", port.name, "; id ", port.portId_ );

        var tabId = getTabId( port );
        tabs[tabId] = {};
        tabs[tabId].port = port;

        // respond immediately with prefs data
        sendToDevToolsForTab( tabId, { "type" : "prefs", "payload" : this.prefs } );

        // Remove port when destroyed (e.g. when devtools instance is closed)
        port.onDisconnect.addListener( function( port ) {
            console.debug( "Disconnecting port ", port.name );
            delete tabs[getTabId( port )];
        } );

        // logs messages from the port (in the background page's console!)
        port.onMessage.addListener( function( msg ) {
            console.log( "Message from port[" + tabId + "]: ", msg );
        } );

        /**
         * Monitor for page load/complete events in tabs
         */
        browser.tabs.onUpdated.addListener( function( _tabId, changeInfo, tab ) {
            if( _tabId in tabs ) {
                if( changeInfo.status == "loading" ) {
                    tabs[_tabId].loading = true;
                } else {
                    // give a little breathing room before marking the load as complete
                    window.setTimeout( function() { tabs[_tabId].loading = false; }, 500 );
                }
            } else {
                /* disable this error message -- too numerous!
                console.error( "onUpdated status change for unknown tab ", _tabId ); */
            }
        } );
    } );

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
     * Receives a data object from the model, decodes it, and passes it on to report()
     */
    function decodeUrl( data ) {

        var url = data.url, postData = null;
        if( data.method === 'POST' ) {
            postData =  String.fromCharCode.apply( null, new Uint8Array( data.requestBody.raw[0].bytes ) );
        }

        var val,
            u = new OmnibugUrl( data.url, postData ),
            obj = {
                state: data,    // raw data from the browser event
                raw: {}
            };

        var that = this,
            processedKeys = {},
            provider = data.omnibugProvider;

        u.getQueryNames().forEach( function( n ) {
            if( n ) {
                vals = u.getQueryValues( n );
                processQueryParam( n, vals, provider, processedKeys, obj["raw"] );
            }
        } );

        delegateCustomProcessing( data.url, provider, processedKeys, obj["raw"] );

        // merge processedKeys into obj
        for( var key in processedKeys ) {
            if( processedKeys.hasOwnProperty( key ) ) {
                obj[key] = processedKeys[key];
            }
        }

        obj = augmentData( obj );
        return obj;
    }

    /**
     * Takes a single name/value pair and delegates handling of it to the provider
     * Otherwise, inserts into the `other' bucket
     */
    function processQueryParam( name, value, provider, container, rawCont ) {
        if( provider.handleQueryParam( name, value, container, rawCont ) ) {
            // noop (container (and rawCont) modified by provider's method)
        } else {
            // stick in `other' (and rawCont)
            container["other"] = container["other"] || {};
            container["other"][name] = value;
            rawCont[name] = value;
        }
    }

    /**
     * If the provider defines a custom URL handler, delegate to it
     */
    function delegateCustomProcessing( url, provider, container, rawCont ) {
        if( typeof( provider.handleCustom ) === "function" ) {
            provider.handleCustom( url, container, rawCont );
        }
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

}() );