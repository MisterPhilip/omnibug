/*
 * Omnibug
 * Persistent event page, running in background (controller)
 */

/*

for now,
- ignore logfile
- ignore watches

@TODO:
-prefs change listener
-options page to do our prefs
-highlightKeys

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

        chrome.storage.local.set( { "omnibug" : prefs }, function() {
            if( !! chrome.runtime.lastError ) {
                console.error( "Error setting prefs: ", chrome.runtime.lastError );
            }
        } );

        // force a (re)load of prefs, now that they may have changed
        loadPrefsFromStorage();
    }


    /**
     * Grab prefs data from storage
     */
    function loadPrefsFromStorage() {
        chrome.storage.local.get( "omnibug", function( prefData ) {
            that.prefs = prefData.omnibug;
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
    var responseStartedCallback = function( details ) {
        // ignore chrome:// requests and non-metrics URLs
        if( details.tabId == -1 || !shouldProcess( details.url ) ) return;

        if( !( details.tabId in tabs ) ) {
            console.error( "Request for unknown tabId ", details.tabId );
            return;
        }

        // store the current tab's loading state into the details object
        details.omnibugLoading = tabs[details.tabId].loading;

        chrome.tabs.get( details.tabId, detailsProcessingCallbackFactory( details ) );
    };


    /**
     * Factory function returning a function which has access to details *and* tab
     */
    var detailsProcessingCallbackFactory = function( details ) {
        return function( tab ) {
            // save the tab's current URL into the details object
            details.tabUrl = tab.url;

            sendToDevToolsForTab( details.tabId, { "type" : "webEvent", "payload" : decodeUrl( details ) } );
        }
    };


    chrome.webRequest.onResponseStarted.addListener(
        responseStartedCallback,
        { urls: ["<all_urls>"] }
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
        if( port.name.substring( 0,10 ) !== "omnibug" ) return;
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

        port.onMessage.addListener( function( msg ) {
            console.log( "Message from port[" + tabId + "]: ", msg );
        } );

        /**
         * Monitor for page load/complete events in tabs
         */
        chrome.tabs.onUpdated.addListener( function( _tabId, changeInfo, tab ) {
            if( _tabId in tabs ) {
                if( changeInfo.status == "loading" ) {
                    tabs[_tabId].loading = true;
                } else {
                    // give a little breathing room before marking the load as complete
                    window.setTimeout( function() { tabs[_tabId].loading = false; }, 500 );
                }
            } else {
                console.error( "onUpdated status change for unknown tab ", _tabId );
            }
        } );
    } );


    /**
     * Send a message to the devtools panel on a given tab
     * Assumes the port is already connected
     */
    function sendToDevToolsForTab( tabId, object ) {
        console.debug( "sending ", object.type, " message to tabId: ", tabId, ": ", object );
        try {
            tabs[tabId].port.postMessage( object );
        } catch( ex ) {
            console.error( "error calling postMessage: ", ex );
        }
    }

    /*
    // Function to send a message to all devtool.html views:
    function notifyDevtools(msg) {
        Object.keys(tabs).forEach(function(portId_) {
            tabs[portId_].postMessage(msg);
        });
    }
    */

    /**
     * Receives a data object from the model, decodes it, and passes it on to report()
     */
    function decodeUrl( data ) {
        var val,
            u = new OmniUrl( data.url ),
            obj = {
                state: data,    // raw data from the browser event
                raw: {},        // ungrouped object of all props
                vars: {},       // omniture evars
                props: {},      // omniture props
                other: {},      // any other values
                useful: {},     // values marked as useful
                moniforce: {},  // moniforce values
                webtrends: {},  // webtrends values
                toString: function() {
                    return "Obj{\n\tvars=" + this.vars + "\n\tprops=" + this.props + "\n\tother=" + this.other + "}";
                }
            };

        var that = this;
        u.getQueryNames().forEach( function( n ) {
            if( n ) {
                val = u.getFirstQueryValue( n ).replace( "<", "&lt;" );  // escape HTML in output HTML

                if( that.prefs.usefulKeys[n] ) {
                    // 'useful' keys
                    obj.useful[n] = val;
                    obj.raw[n] = val;
                } else if( n.match( /^c(\d+)$/ ) || n.match( /^prop(\d+)$/i ) ) {
                    // omniture props
                    obj.props["prop"+RegExp.$1] = val;
                    obj.raw["prop"+RegExp.$1] = val;
                } else if( n.match( /^v(\d+)$/ ) || n.match( /^evar(\d+)$/i ) ) {
                    // omniture evars
                    obj.vars["eVar"+RegExp.$1] = val;
                    obj.raw["eVar"+RegExp.$1] = val;
                } else if( n.match( /^\[?AQB\]?$/ ) || n.match( /^\[?AQE\]?$/ ) ) {
                    // noop; skip Omniture's [AQB] and [AQE] elements
                } else if( n.match( /^mfinfo/ ) ) {
                    // moniforce
                    obj.moniforce[n] = val;
                    obj.raw[n] = val;
                } else if( n.match( /^WT\./ ) ) {
                    // webtrends
                    obj.webtrends[n] = val;
                    obj.raw[n] = val;
                } else {
                    // everything else
                    obj.other[n] = val;
                    obj.raw[n] = val;
                }
            }
        } );

        obj = augmentData( obj );
        return obj;
    }


    /**
     * Augments the data object with summary data
     * @param data the data object
     * @return the augmented data object
     */
    function augmentData( data ) {
        data["omnibug"] = {};

        // workaround -- kill it when vendor-specific code in place
        var eventType = ( data.state.omnibugLoading ? "load" : "click" ),
            url = data.state.url,
            urlLength = data.state.url.length,
            provider = ( url.match( /(?:\/b\/ss|2o7)/ ) ? "Omniture" :
                ( url.match( /moniforce\.gif/ ) ? "Moniforce" :
                    ( url.match( /dcs\.gif/ ) ? "WebTrends" :
                        ( url.match( /__utm\.gif/ ) ? "Urchin" :
                            ( url.match( /\/collect\?/ ) ? "UniversalAnalytics" :
                                "Unknown"
                            )
                        )
                    )
                )
            );

        // hacky: sometimes load events are being reported as click events.  For Omniture, detect
        // the event type (pe= means a click event), and reset eventType accordingly.
        if( provider === "Omniture" ) {
            var oldEventType = eventType;
            eventType = ( !!url.match( "[?&]pe=" ) ? "click" : "load" );
        }

        data.omnibug["Key"]         = data.raw["Key"]         = data.state.requestId;
        data.omnibug["Event"]       = data.raw["Event"]       = eventType;
        data.omnibug["Timestamp"]   = data.raw["Timestamp"]   = data.state.timeStamp;
        data.omnibug["Provider"]    = data.raw["Provider"]    = provider;
        //data.omnibug["Source"]     = data.raw["Source"]     = ( data.state.src === "prev" ? "Previous page" : "Current page" ); // might not be exactly working
        data.omnibug["Parent URL"]  = data.raw["Parent URL"]  = data.state.tabUrl;
        data.omnibug["Full URL"]    = data.raw["Full URL"]    = data.state.url
                                                              + "<br/>(" + urlLength + " characters"
                                                              + ( urlLength > 2083
                                                                  ? ", <span class='imp'>*** too long for IE6/7! ***</span>"
                                                                  : "" )
                                                              + ")";
        data.omnibug["RequestId"]   = data.raw["RequestId"]   = data.state.requestId;
        data.omnibug["StatusLine"]  = data.raw["StatusLine"]  = data.state.statusLine;
        data.omnibug["RequestType"] = data.raw["RequestType"] = data.state.type;

        return data;
    }


    /**
     * OmniUrl: class to parse a URL into component pieces
     */
    var OmniUrl = function( url ) {
        this.url = url;
        this.parseUrl();
    };

    OmniUrl.prototype = (function() {
        var U = {
            hasQueryValue: function( key ) {
                return typeof this.query[key] !== 'undefined';
            },
            getFirstQueryValue: function( key ) {
                return this.query[key] ? this.query[key][0] : '';
            },
            getQueryValues: function( key ) {
                return this.query[key] ? this.query[key] : [];
            },
            getQueryNames: function() {
                var i, a = [];
                for( i in this.query ) {
                    a.push( i );
                }
                return a;
            },
            getLocation: function() {
                return this.location;
            },
            getParamString: function() {
                return this.paramString;
            },
            addQueryValue: function( key ) {
                if( ! this.hasQueryValue( key ) ) {
                    this.query[key] = [];
                }
                for( var i=1; i<arguments.length; ++i ) {
                    this.query[key].push( arguments[i] );
                }
            },
            decode: function( val ) {
                var retVal;
                try {
                    return val ? decodeURIComponent( val.replace( /\+/g, "%20" ) ) : val === 0 ? val : '';
                } catch( e ) {
                    return val;
                }
            },
            parseUrl: function() {
                var url = this.url;
                var pieces = url.split( '?' );
                var p2 = pieces[0].split( ';' );
                this.query = {};
                this.queryString = '';
                this.anchor = '';
                this.location = p2[0];
                this.paramString = ( p2[1] ? p2[1] : '' );
                if( pieces[1] ) {
                    var p3 = pieces[1].split( '#' );
                    this.queryString = p3[0];
                    this.anchor = ( p3[1] ? p3[1] : '' );
                }
                if( this.queryString ) {
                    var kvPairs = this.queryString.split( /&/ );
                    for( var i=0; i<kvPairs.length; ++i ) {
                        var kv = kvPairs[i].split( '=' );
                        this.addQueryValue( kv[0] ? this.decode( kv[0] ) : "", kv[1] ? this.decode( kv[1] ) : "" );
                    }
                }
            }
        };
        return U;
    } )();


    // public
    return {};

}() );
