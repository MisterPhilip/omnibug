/*
 * Omnibug
 * Persistent event page, running in background (controller)
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
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
            defaultPattern : "/b/ss/|2o7|moniforce\.gif|dcs\.gif|__utm\.gif|\/collect\/?\?",
            usefulKeys     : [ "pageName", "ch", "h1", "purchaseID", "events", "products", "pev2" ],
            highlightKeys  : [ "events", "products" ],
            //enableFileLogging : false,

            // show entries expanded?
            alwaysExpand : false,

            // surround values with quotes?
            showQuotes : true,

            // show full variable names?
            showFullNames : true,

            // colors
            color_load   : "#dbedff",
            color_click  : "#f1ffdb",
            color_prev   : "#ffd5de",
            color_quotes : "#f00",
            color_hilite : "#ff0",
            color_hover  : "#ccc",

            keyTitles : {
                Urchin: {
                      utmac:  "Account string"
                    , utmcc:  "Cookie values"
                    , utmcn:  "New campaign session?"
                    , utmcr:  "Repeat campaign visit?"
                    , utmcs:  "Browser language encoding"
                    , utmdt:  "Page title"
                    , utme:   "Extensible parameter"
                    , utmfl:  "Flash version"
                    , utmhn:  "Host name"
                    , utmipc: "Product code/SKU"
                    , utmipn: "Product name"
                    , utmipr: "Unit price"
                    , utmiqt: "Quantity"
                    , utmiva: "Item variations"
                    , utmje:  "Java-enabled browser?"
                    , utmn:   "Unique ID"
                    , utmp:   "Page request"
                    , utmr:   "Referrer URL"
                    , utmsc:  "Screen color depth"
                    , utmsr:  "Screen resolution"
                    , utmt:   "Request type"
                    , utmtci: "Billing city"
                    , utmtco: "Billing country"
                    , utmtid: "Order ID"
                    , utmtrg: "Billing region"
                    , utmtsp: "Shipping cost"
                    , utmtst: "Affiliation"
                    , utmtto: "Order Total"
                    , utmttx: "Tax"
                    , utmul:  "Browser language"
                    , utmwv:  "Tracking code version"
                    , utmhid: "AdSense Hit ID"
                    , utms:   "Requests made this session"
                    , utmu:   "Client usage/Error data"
                    , utmip:  "IP address"
                    , utmvp:  "Viewport resolution"
                    , utmni:  "Non-interaction event"
                    , utmcsr: "Campaign source"
                    , utmccn: "Campaign name"
                    , utmcmd: "Campaign medium"
                    , utmctr: "Campaign term/key phrase"
                    , utmcct: "Campaign content"
                    , utmsa:  "Social action"
                    , utmsid: "Social destination"
                    , utmsn:  "Social network name"
                    , utmht:  "Time dispatched"
                },

                Omniture : {
                      ns:     "Visitor namespace"
                    , ndh:    "Image sent from JS?"
                    , ch:     "Channel"
                    , v0:     "Campaign"
                    , r:      "Referrer URL"
                    , ce:     "Character set"
                    , cl:     "Cookie lifetime"
                    , g:      "Current URL"
                    , j:      "JavaScript version"
                    , bw:     "Browser width"
                    , bh:     "Browser height"
                    , s:      "Screen resolution"
                    , c:      "Screen color depth"
                    , ct:     "Connection type"
                    , p:      "Netscape plugins"
                    , k:      "Cookies enabled?"
                    , hp:     "Home page?"
                    , pid:    "Page ID"
                    , pidt:   "Page ID type"
                    , oid:    "Object ID"
                    , oidt:   "Object ID type"
                    , ot:     "Object tag name"
                    , pe:     "Link type"
                    , pev1:   "Link URL"
                    , pev2:   "Link name"
                    , pev3:   "Video milestone"
                    , c1:     "Prop1"
                    , h1:     "Hierarchy var1"
                    , h2:     "Hierarchy var2"
                    , h3:     "Hierarchy var3"
                    , h4:     "Hierarchy var4"
                    , h5:     "Hierarchy var5"
                    , v1:     "EVar1"
                    , cc:     "Currency code"
                    , t:      "Browser time"  // "[d/m/yyyy]   [hh:mm:ss]  [weekday]  [time zone offset]"
                    , v:      "Javascript-enabled browser?"
                    , v0:     "Campaign variable"
                    , pccr:   "Prevent infinite redirects"
                    , vid:    "Visitor ID"
                    , vidn:   "New visitor ID"
                    , cdp:    "Cookie domain periods"
                    , pageName: "Page name"
                    , pageType: "Page type"
                    , server: "Server"
                    , events: "Events"
                    , products: "Products"
                    , purchaseID: "Purchase ID"
                    , state:  "Visitor state"
                    , vmk:    "Visitor migration key"
                    , vvp:    "Variable provider"
                    , xact:   "Transaction ID"
                    , zip:    "ZIP/Postal code"
                },

                UniversalAnalytics : {
                      v:      "Protocol Version"
                    , tid:    "Tracking ID"
                    , aip:    "Anonymize IP"
                    , qt:     "Queue Time"
                    , z:      "Cache Buster"
                    , cid:    "Client ID"
                    , sc:     "Session Control"
                    , dr:     "Document Referrer"
                    , cn:     "Campaign Name"
                    , cs:     "Campaign Source"
                    , cm:     "Campaign Medium"
                    , ck:     "Campaign Keyword"
                    , cc:     "Campaign Content"
                    , ci:     "Campaign ID"
                    , gclid:  "Google AdWords ID"
                    , dclid:  "Google Display Ads ID"
                    , sr:     "Screen Resolution"
                    , vp:     "Viewport Size"
                    , de:     "Document Encoding"
                    , sd:     "Screen Colors"
                    , ul:     "User Language"
                    , je:     "Java Enabled"
                    , fl:     "Flash Version"
                    , t:      "Hit Type"
                    , ni:     "Non-Interaction Hit"
                    , dl:     "Document location URL"
                    , dh:     "Document Host Name"
                    , dp:     "Document Path"
                    , dt:     "Document Title"
                    , cd:     "Content Description"
                    , an:     "Application Name"
                    , av:     "Application Version"
                    , ec:     "Event Category"
                    , ea:     "Event Action"
                    , el:     "Event Label"
                    , ev:     "Event Value"
                    , ti:     "Transaction ID"
                    , ta:     "Transaction Affiliation"
                    , tr:     "Transaction Revenue"
                    , ts:     "Transaction Shipping"
                    , tt:     "Transaction Tax"
                    , "in":     "Item Name"
                    , ip:     "Item Price"
                    , iq:     "Item Quantity"
                    , ic:     "Item Code"
                    , iv:     "Item Category"
                    , cu:     "Currency Code"
                    , sn:     "Social Network"
                    , sa:     "Social Action"
                    , st:     "Social Action Target"
                    , utc:    "User timing category"
                    , utv:    "User timing variable name"
                    , utt:    "User timing time"
                    , utl:    "User timing label"
                    , plt:    "Page Load Time"
                    , dns:    "DNS Time"
                    , pdt:    "Page Download Time"
                    , rrt:    "Redirect Response Time"
                    , tcp:    "TCP Connect Time"
                    , srt:    "Server Response Time"
                    , exd:    "Exception Description"
                    , exf:    "Is Exception Fatal?"
                    , a:      "?"
                    , _v:     "?"
                    , _u:     "?"
                }
            }
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
            /* disable this error message -- too numerous!
            console.error( "Request for unknown tabId ", details.tabId ); */
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
                urchin: {},     // urchin/GA values
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
                } else if( n.match( /^utm.*/ ) ) {
                    obj.urchin[n] = val;
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
        // @TODO: make these keys to a map (for use with keyTitles)
        var eventType = ( data.state.omnibugLoading ? "load" : "click" ),
            url = data.state.url,
            urlLength = data.state.url.length,
            provider = ( url.match( /(?:\/b\/ss|2o7)/ ) ? "Omniture" :
                ( url.match( /moniforce\.gif/ ) ? "Moniforce" :
                    ( url.match( /dcs\.gif/ ) ? "WebTrends" :
                        ( url.match( /__utm\.gif/ ) ? "Urchin" :
                            ( url.match( /\/collect\/?\?/ ) ? "UniversalAnalytics" :
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

        data.omnibug["Event"]       = data.raw["Event"]       = eventType;
        data.omnibug["Timestamp"]   = data.raw["Timestamp"]   = data.state.timeStamp;
        data.omnibug["Provider"]    = data.raw["Provider"]    = provider;
        data.omnibug["Parent URL"]  = data.raw["Parent URL"]  = data.state.tabUrl;
        data.omnibug["Full URL"]    = data.raw["Full URL"]    = data.state.url
                                                              + "<br/>(" + urlLength + " characters"
                                                              + ( urlLength > 2083
                                                                  ? ", <span class='imp'>*** too long for IE6/7! ***</span>"
                                                                  : "" )
                                                              + ")";
        data.omnibug["Request ID"]   = data.raw["Request ID"]   = data.state.requestId;
        data.omnibug["Status Line"]  = data.raw["Status Line"]  = data.state.statusLine;
        data.omnibug["Request Type"] = data.raw["Request Type"] = data.state.type;

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
