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
*/

(function() {
    var ports = {};

    /**
     * Installation callback
     */
    function onInit() {
        // logged to DevTools console only
        console.debug( 'eventPage onInit' );
    }
    chrome.runtime.onInstalled.addListener( onInit );

    // pref( "extensions.omnibug.defaultPattern", "/b/ss/|2o7|moniforce\.gif|dcs\.gif|__utm\.gif|\/collect\?" );
    var defaultPattern = "/b/ss/|2o7|moniforce\.gif|dcs\.gif|__utm\.gif|\/collect\?",
        defaultRegex   = new RegExp( defaultPattern );

    function shouldProcess( url ) {
        return url.match( defaultRegex );
        //return true;
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
            sendToDevToolsForTab( details.tabId, details );
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

        ports[getTabId( port )] = port;

        // Remove port when destroyed (e.g. when devtools instance is closed)
        port.onDisconnect.addListener( function( port ) {
            console.debug( "Disconnecting port ", port.name );
            delete ports[getTabId( port )];
        } );

        /*
        port.onMessage.addListener( function( msg ) {
            // Whatever you wish
            //console.debug(msg);
        } );
        */
    } );

    /**
     * Send a message to the devtools panel on a given tab
     * Assumes the port is already connected
     */
    function sendToDevToolsForTab( tabId, object ) {
        if( tabId in ports ) {
            console.debug( "sending requestId ", object.requestId, " to tabId: ", tabId, ": ", object );
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
