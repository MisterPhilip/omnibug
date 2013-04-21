/*
 * Chromnibug
 * Persistent event page, running in background (controller)
 */

/*
possible workflow;
1) receive request here (event page)
2) filter only analytics urls
3) parse and create object
4) send parsed object back to devtools panel for specific tab

for now,
- ignore logfile
- ignore watches
- ignore expandy

@TODO:
-prefs change listener
-options page to do our prefs

*/

(function() {
    var ports = {},
        prefs,
        that = this;

    /**
     * Installation callback
     */
    function onInit() {
        // logged to DevTools console only
        console.debug( 'eventPage onInit' );
        initPrefs();
    }
    chrome.runtime.onInstalled.addListener( onInit );

    /**
     * Store preferences (on extension installation)
     */
    function initPrefs() {
        var prefs = {
            // pattern to match in request url
            defaultPattern : "/b/ss/|2o7|moniforce\.gif|dcs\.gif|__utm\.gif|\/collect\?",
            usefulKeys     : [ "pageName", "ch", "h1", "purchaseID", "events", "products", "pev2" ],
            highlightKeys  : [ "events", "products" ],
            //enableFileLogging : false,

            // show entries expanded?
            alwaysExpand : false,

            // surround values with quotes?
            showQuotes : true,

            // colors
            color_load   : "#dbedff",
            color_click  : "#f1ffdb",
            color_prev   : "#ffd5de",
            color_quotes : "#f00",
            color_hilite : "#ff0",
            color_hover  : "#ccc"
        };

        chrome.storage.local.set( { "chromnibug" : prefs }, function() {
            if( !! chrome.runtime.lastError ) {
                console.error( "Error setting prefs: ", chrome.runtime.lastError );
            }
        } );

        // force a (re)load of prefs, now that they may have changed:w
        loadPrefsFromStorage();
    }

    /**
     * Grab prefs data from storage
     */
    function loadPrefsFromStorage() {
        chrome.storage.local.get( "chromnibug", function( prefData ) {
            that.prefs = prefData.chromnibug;
            that.prefs.defaultRegex = new RegExp( that.prefs.defaultPattern );
        } );
    }
    loadPrefsFromStorage();


    function shouldProcess( url ) {
        return url.match( this.prefs.defaultRegex );
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
    var respStartedCallback = function( details ) {
        if( details.tabId > -1 && shouldProcess( details.url ) ) {
            //console.debug( "matching requestId ", details.requestId, ", tab ", details.tabId );
            sendToDevToolsForTab( details.tabId, { "type" : "webEvent", "payload" : details } );
        }
    };

    chrome.webRequest.onResponseStarted.addListener(
        respStartedCallback,
        {urls: ["<all_urls>"]}
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
    chrome.extension.onConnect.addListener( function( port ) {
        if( port.name.substring( 0,10 ) !== "chromnibug" ) return;
        console.debug( "Registered port ", port.name, "; id ", port.portId_ );

        var tabId = getTabId( port );
        ports[tabId] = port;

        // respond immediately with prefs data
        sendToDevToolsForTab( tabId, { "type" : "prefs", "payload" : this.prefs } );

        // Remove port when destroyed (e.g. when devtools instance is closed)
        port.onDisconnect.addListener( function( port ) {
            console.debug( "Disconnecting port ", port.name );
            delete ports[getTabId( port )];
        } );

        port.onMessage.addListener( function( msg ) {
            console.log( "Message from port[" + tabId + "]: ", msg );
        } );
    } );

    /**
     * Send a message to the devtools panel on a given tab
     * Assumes the port is already connected
     */
    function sendToDevToolsForTab( tabId, object ) {
        if( tabId in ports ) {
            console.debug( "sending ", object.type, " message to tabId: ", tabId, ": ", object );
            try {
                ports[tabId].postMessage( object );
            } catch( ex ) {
                console.error( "error calling postMessage: ", ex );
            }
        } else {
            console.error( "tried to send to invalid tabId: ", tabId );
        }
    }

    /*
    // Function to send a message to all devtool.html views:
    function notifyDevtools(msg) {
        Object.keys(ports).forEach(function(portId_) {
            ports[portId_].postMessage(msg);
        });
    }
    */

    // public
    return {};

}() );
