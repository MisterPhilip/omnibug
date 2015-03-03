/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if( typeof FBL === "undefined" ) {
    FBL = { ns: function() {} }
}

FBL.ns( function() { with( FBL ) {

    // Components.classes helper
    if( typeof( "CC" ) !== "function" ) {
        function CC( className ) {
            return Components.classes[className];
        }
    }

    // Components.interfaces helper
    if( typeof( "CI" ) !== "function" ) {
        function CI( ifaceName ) {
            if(typeof Components.interfaces[ifaceName] !== 'undefined')
                return Components.interfaces[ifaceName];
            _dump( "Error instantiating component interface: " + ifaceName + "\n" );
            return {};
        }
    }

    function pad( n ) {
        return '' + ( n <= 9 ? "00" : n <= 99 ? "0" : '' ) + n;
    }
    function _dump( str ) { var d = new Date(); dump( d.toLocaleTimeString() + "." + pad( d.getMilliseconds() ) + ":  " + str ); }

    // from FB's lib.js (not present in older versions)
    function _getUniqueId() {
        return Math.floor(Math.random() * (65535 - 0 + 1) + 0);
    }


    // ************************************************************************************************
    // Constants

    const nsIWebProgressListener = CI( "nsIWebProgressListener" );
    const nsIWebProgress = CI( "nsIWebProgress" );
    const nsISupportsWeakReference = CI( "nsISupportsWeakReference" );
    const nsIObserverService = CI( "nsIObserverService" );
    const nsISupports = CI( "nsISupports" );

    const NOTIFY_STATE_DOCUMENT = nsIWebProgress.NOTIFY_STATE_DOCUMENT;
    const NOTIFY_ALL = nsIWebProgress.NOTIFY_ALL;

    const STATE_IS_WINDOW = nsIWebProgressListener.STATE_IS_WINDOW;
    const STATE_IS_DOCUMENT = nsIWebProgressListener.STATE_IS_DOCUMENT;
    const STATE_IS_REQUEST = nsIWebProgressListener.STATE_IS_REQUEST;
    const STATE_START = nsIWebProgressListener.STATE_START;
    const STATE_STOP = nsIWebProgressListener.STATE_STOP;
    const STATE_TRANSFERRING = nsIWebProgressListener.STATE_TRANSFERRING;

    Firebug.Omnibug = extend( Firebug.Module, {
        cfg: {
            requests: {},
            latestOmnibugContext: null,
            defaultRegex: null,
            userRegex: null,
            highlightKeys: {},
            watchKeys: {},
            alwaysExpand: false,
            showQuotes: false,
            showFullNames: true,
            outFile: null,
            prefsService: null,
            win: null,
        },


        /**
         * Called when the browser exits
         * @override
         */
        shutdown: function() {
            //_dump( "shutdown\n" );
            if( Firebug.getPref( 'defaultPanelName' ) === 'Omnibug' ) {
                Firebug.setPref( 'defaultPanelName', 'console' );
            }
        },


        /**
         * ?
         * @override
        initializeUI: function( detachArgs ) {
        },
         */


        /**
         * Called when panels are selected
         * @override
         */
        showPanel: function( browser, panel ) {
            //_dump( "showPanel: browser=" + browser + "; panel=" + panel + "\n" );
            var isOmnibug = panel && panel.name === "Omnibug";
            var OmnibugButtons = Firebug.chrome.$( "fbOmnibugButtons" );
            collapse( OmnibugButtons, !isOmnibug );
        },

        /**
         * ?
         * @override
        showSidePanel: function( browser, panel ) {
        },
         */

        /**
         * Called when the clear button is pushed
         */
        clearPanel: function() {
            this.getContext().getPanel("Omnibug").clear();
        },

        /**
         * Show the prefs menu
         */
        showMenu: function() {
            openDialog( "chrome://omnibug/content/options.xul",
                        "",
                        "centerscreen,dialog=no,chrome,resizable,dependent,modal,toolbar"
            );
        },

        /**
         * Initialize the preferences service
         */
        initPrefsService: function() {
            try {
                this.cfg.prefsService = CC( '@mozilla.org/preferences-service;1' )
                                      .getService( CI( "nsIPrefService" ) )
                                      .getBranch( "extensions.omnibug." );

                this.cfg.prefsService.QueryInterface( CI( "nsIPrefBranchInternal" ) );

                // add prefs observer
                this.cfg.prefsService.addObserver( "", this, false );
            } catch( ex ) {
                _dump( "initPrefsService: error getting prefs service: " + ex + "\n" );
            }
        },

        /**
         * Gets a preference from the preference service
         */
        getPreference: function( key ) {
            switch( this.cfg.prefsService.getPrefType( key ) ) {
                case Components.interfaces.nsIPrefBranch.PREF_STRING:
                    return this.cfg.prefsService.getCharPref( key );
                case Components.interfaces.nsIPrefBranch.PREF_INT:
                    return this.cfg.prefsService.getIntPref( key );
                case Components.interfaces.nsIPrefBranch.PREF_BOOL:
                    return this.cfg.prefsService.getBoolPref( key );
            }
        },

        /**
         * Sets a preference
         */
        setPreference: function( key, val ) {
            switch( this.cfg.prefsService.getPrefType( key ) ) {
                /*
                case Components.interfaces.nsIPrefBranch.PREF_STRING:
                    this.cfg.prefsService.setCharPref( key, val);
                    break;
                */
                case Components.interfaces.nsIPrefBranch.PREF_INT:
                    this.cfg.prefsService.setIntPref( key, val );
                    break;
                case Components.interfaces.nsIPrefBranch.PREF_BOOL:
                    this.cfg.prefsService.setBoolPref( key, val );
                    break;
                default:
                    this.cfg.prefsService.setCharPref( key, val);
                    break;
            }
        },


        /**
         * Called once, at browser startup
         * @override
         */
        initialize: function() {
            _dump( "initialize: arguments=" + arguments + "\n" );

            // call parent's init method
            Firebug.Module.initialize.apply( this, arguments );

            this.initPrefsService();

            // initialize prefs
            this.initPrefs();

            // register observers -- once for the entire extension
            try {
                this.observerService = CC( "@mozilla.org/observer-service;1" ).getService( nsIObserverService );
                //this.observerService.addObserver( this.requestObserver, "http-on-modify-request", false );
                this.observerService.addObserver( this.responseObserver, "http-on-examine-response", false );
            } catch( ex ) {
                _dump( "initialize: exception registering HTTP observers: " + ex + "\n" );
            }
            // @TODO: should we ever removeObserver?
        },


        /**
         * called for topic of http-on-examine-response (after response is available)
         * subject may be: [xpconnect wrapped nsIHttpChannel] (also maybe nsISupports, nsIRequest, nsIChannel)
         * @TODO: not handling redirects right
         * @TODO: for some reason, not catching beacons on links that change the page. (timing issue; works with an alert)
         *        not due to cache, maybe this? http://forums.mozillazine.org/viewtopic.php?f=19&t=643636
         *        TamperData doesn't see those responses either, so maybe nothing we can do
         */
        responseObserver: {
            observe: function( subject, topic, data ) {
                if( typeof Firebug !== "undefined" ) {
                    var key, statusStr,
                        omRef = Firebug.Omnibug;

                    //_dump( "responseObserver: subj=" + subject + "; topic=" + topic + "; key=" + key + "\n" );

                    if(    ( subject && subject.name && subject.name.match( omRef.cfg.defaultRegex ) )
                        || ( subject && subject.name && omRef.cfg.userRegex && subject.name.match( omRef.cfg.userRegex ) ) ) {
                        key = Md5Impl.md5( subject.name );
                        _dump( "responseObserver: key=" + key + "; sc=" + subject.responseStatus + "; st=" + subject.responseStatusText + "\n" );

                        statusStr = subject.responseStatus + " " + subject.responseStatusText;

                        // update panel
                        if( omRef != null && omRef.getContext() != null && omRef.getContext().getPanel( "Omnibug" ) != null ) {
                            omRef.getContext().getPanel( "Omnibug" ).updateEntryState( key, statusStr ); // in updateEntryState, also add to summary section?
                        }

                        // update request list
                        if( omRef.cfg.requests[key] ) {
                            omRef.cfg.requests[key]["statusText"] = statusStr;
                            _dump( "responseObserver: updating request in list for key=" + key + "\n" );
                        }
                    }
                }
            }
        },


        /**
         * Initialize prefs
         *   this is called by initialize(), as well by the prefs observer service
         */
        initPrefs: function() {
            _dump( "initPrefs: (re)initializing preferences\n" );

            // logging
            this.initLogging();

            // general prefs
            this.initGeneralPrefs();

            // init request-matching patterns
            this.initPatterns();
        },


        /**
         * Preferences observer handler
         */
        observe: function( subject, topic, key ) {
            _dump( "observe: subject='" + subject + "'; topic='" + topic + "'; key='" + key + "'; value='" + this.getPreference( key ) + "'\n" );

            if( topic !== "nsPref:changed" ) {
                return;
            }

            //var newValue = this.getPreference( key );

            switch( key ) {
                case "alwaysExpand":
                case "showQuotes":
                case "showFullNames":
                case "color_load":
                case "color_click":
                case "color_prev":
                case "color_quotes":
                case "color_hilite":
                case "color_hover":
                    this.initGeneralPrefs();
                    break;

                case "enableFileLogging":
                case "logFileName":
                    this.initLogging();
                    break;

                case "defaultPattern":
                case "userPattern":
                case "highlightKeys":
                case "watchKeys":
                    this.initPatterns();
                    break;
            }

            // Outside the switch so we can use startsWith()
            if( key.startsWith( "provider." ) ) {
                this.initPatterns();
            }
        },


        /**
         * Init logging behavior
         */
        initLogging: function() {
            _dump( "initLogging: arguments=" + arguments + "\n" );

            var fileOutput = this.getPreference( "enableFileLogging" );
            _dump( "initLogging: fileOutput=" + fileOutput + "\n" );
            if( fileOutput ) {
                var prefFile;
                try {
                    prefFile = this.getPreference( "logFileName" );
                } catch( ex ) {}

                try {
                    if( prefFile ) {
                        _dump( "initLogging: enabling logging to " + prefFile + "\n" );
                        this.cfg.outFile = FileIO.open( prefFile );
                    } else {
                        _dump( "initLogging: enabling logging to default log file\n" );
                        var path = FileIO.getTmpDir();
                        var fn = "omnibug.log";
                        this.cfg.outFile = FileIO.append( path, fn );
                    }

                    var msg = "File logging enabled; requests will be written to " + this.cfg.outFile.path;
                    _dump( "initLogging: " + msg + "\n" );
                } catch( ex ) {
                    _dump( "initLogging: unable to create output file: " + ex + "\n" );
                }
            } else {
                _dump( "initLogging: logging is disabled.\n" );
                this.cfg.outFile = null;
            }
        },


        /**
         * Init general prefs
         */
        initGeneralPrefs: function() {
            // always expand preference
            this.cfg.alwaysExpand = this.getPreference( "alwaysExpand" );

            // quotes around values pref
            this.cfg.showQuotes = this.getPreference( "showQuotes" );

            // descriptions instead of keys
            this.cfg.showFullNames = this.getPreference( "showFullNames" );

            // colors
            this.cfg.color_load = this.getPreference( "color_load" );
            this.cfg.color_click = this.getPreference( "color_click" );
            this.cfg.color_prev = this.getPreference( "color_prev" );
            this.cfg.color_quotes = this.getPreference( "color_quotes" );
            this.cfg.color_hilite = this.getPreference( "color_hilite" );
            this.cfg.color_hover = this.getPreference( "color_hover" );
        },


        /**
         * Called when new page is going to be rendered
         * @override
         */
        initContext: function( context ) {
            // keep a private copy around for ourselves
            this.context = context;

            if( ! context.browser.uid ) {
                context.browser.uid = _getUniqueId();
            }
            _dump( "initContext: context[" + context.uid + "]; browser[" + context.browser.uid + "]\n" );

            context.omnibug = {};
            context.omnibug.doneLoading = false;

            this.monitorContext( context );

            // expire old requests
            this.expireRequests( context );
        },

        /**
         * Private to get at the context (instead of using global FirebugContext)
         */
        getContext: function() {
            return this.context;
        },

        /**
         * Called just before old page is thrown away;
         * @override
         */
        destroyContext: function( context ) {
            _dump( "destroyContext: context[" + context.uid + "]\n\n\n" );

            this.cfg.latestOmnibugContext = undefined;
            context.omnibug.loaded = false;
            if( context.omNetProgress ) {
                this.unmonitorContext( context );
            }
        },

        /**
         * Called when ANY page is completely finished loading
         * @override
         */
        loadedContext: function( context ) {
            _dump( "loadedContext: context[" + context.uid + "]; browser[" + context.browser.uid + "]\n" );

            // Makes detach work.
            if ( ! context.omnibugContext && this.cfg.latestOmnibugContext ) {
                context.omnibugContext = this.cfg.latestOmnibugContext;
            }

            context.omnibug.loaded = true;

            // dump any requests waiting
            this.processRequests( context );
        },

        /**
         * ?
         * @override
         */
        reattachContext: function( context ) {
            _dump( "reattachContext: context[" + context.uid + "]\n" );

            var panel = context.getPanel( panelName );
            this.addStyleSheet( panel.document );

            // Makes detach work.
            if ( ! context.getPanel( "Omnibug" ).document.omnibugContext ) {
                // Save a pointer back to this object from the iframe's document:
                context.getPanel( "Omnibug" ).document.omnibugPanel = context.getPanel( "Omnibug" );
                context.getPanel( "Omnibug" ).document.omnibugContext = context.omnibugContext;
            }
        },

        /**
         * Called as page is rendering (?)
         * @override
        showContext: function( browser, context ) {
            _dump( "showContext: context[" + context.uid + "]; browser[" + browser.uid + "]\n" );
        },
         */

        /**
         * ?
         * @override
         */
        watchContext: function( win, context, isSystem ) {
            _dump( "watchContext: context[" + context.uid + "]; win=" + win + "; isSystem=" + isSystem + "\n" );
        },

        /**
         * Called from initContext()
         */
        monitorContext: function( context ) {
            //_dump( "monitorContext: context=" + context + "\n" );

            if( !context.omNetProgress ) {
                context.omNetProgress = new OmNetProgress( context );
                context.browser.addProgressListener( context.omNetProgress, NOTIFY_ALL );
            }
        },

        /**
         * Called from destroyContext()
         */
        unmonitorContext: function( context ) {
            //_dump( "unmonitorContext: context=" + context + "\n" );
            if( context.omNetProgress ) {
                if( context.browser.docShell ) {
                    context.browser.removeProgressListener( context.omNetProgress, NOTIFY_ALL );
                }

                delete context.omNetProgress;
            }
        },

        /**
         * Called when navigating away from a page
         * @override
         */
        unwatchWindow: function( context, win ) {
            //_dump( "unwatchWindow: context[" + context.uid + "]; win[" + win.uid + "]\n" );
            this.cfg.win = null;
        },

        /**
         * Called when a new page is going to be watched (?)
         * @override
         */
        watchWindow: function( context, win ) {
            if( ! win.uid ) {
                win.uid = _getUniqueId();
            }
            //_dump( "watchWindow: context[" + context.uid + "]; win[" + win.uid + "]\n" );
            this.cfg.win = win; // @TODO: not sure 'this' is the right place for the window reference
        },

        /**
         * Called by loadedContext to process the requests object and write to panel
         */
        processRequests: function( context ) {
            var age,
                requests = Firebug.Omnibug.cfg.requests;

            _dump( "processRequests: processing " + Object.sizeof( requests ) + " requests; context[" + context.uid + "]; browser[" + context.browser.uid + "]\n" );

            try {
                for( var key in requests ) {
                    if( requests.hasOwnProperty( key ) ) {
                        age = ( new Date() - requests[key].timeStamp ) / 1000;
                        _dump( "processRequests: processing " + key + " (browser[" + requests[key]["browser"].uid + "]; age=" + age + "): " );

                        // only process the requests if they are for "our" browser (the one that generated the request)
                        if( context.browser === requests[key]["browser"] ) {
                            requests[key]["src"] = "prev";
                            _dump( "valid for this browser; calling decodeUrl\n" );
                            try {
                                context.getPanel( "Omnibug" ).decodeUrl( requests[key] );
                                delete requests[key];
                            } catch( ex ) {
                                _dump( "processRequests: exception in decodeUrl(): " + e );
                            }
                        } else {
                            _dump( "invalid for this browser; skipping\n" );
                        }
                    }
                }
            } catch( ex ) {
                _dump( "processRequests: caught exception: " + ex + "\n" );
            }
            _dump( "processRequests: done (" + Object.sizeof( requests ) + " remaining)\n" );
        },


        /**
         * Called by initContext to expire old requests
         *
         * The point of requests[] is to keep track of requests that need to be shown from the previous page load (e.g. a link to
         * another page with a web beacon).  When run from initContext, valid requests would have just been generated moments ago,
         * while invalid requests (those generated from a previous page and are no longer applicable) have a much older date
         */
        expireRequests: function( context ) {
            var age,
                requests = Firebug.Omnibug.cfg.requests;

            _dump( "expireRequests: processing " + Object.sizeof( requests ) + " requests; context[" + context.uid + "]\n" );

            try {
                for( var key in requests ) {
                    if( requests.hasOwnProperty( key ) ) {
                        age = ( new Date() - requests[key].timeStamp ) / 1000;
                        _dump( "expireRequests: processing " + key + " (browser[" + requests[key]["browser"].uid + "]; age=" + age + "): " );

                        if( age > 3 ) { // 3s seems like a reasonable starting point
                            // request is old, throw it out
                            _dump( "expired; removing entry\n" );
                            delete requests[key];
                        } else {
                            _dump( "no expiration needed\n" );
                        }
                    }
                }
            } catch( ex ) {
                _dump( "expireRequests: caught exception: " + ex + "\n" );
            }
            _dump( "expireRequests: done (" + Object.sizeof( requests ) + " remaining)\n" );
        },


        /**
         * Tools menu handler
         */
        omnibugTools: function( menuitem ) {
            //_dump( "omnibugTools: label=" + menuitem.label + "\n" );

            if( menuitem.label === "Choose log file" ) {
                if( Omnibug.Tools.chooseLogFile( this.cfg.win ) ) {
                    // successfully picked a log file
                    _dump( "omnibugTools: logFileName=" + this.getPreference( "logFileName" ) + "\n" );
                }
            }
        },


        /**
         * ?
         * @override
        updateOption: function( name, value ) {
        },
         */

        /**
         * ?
         * @override
        getObjectByURL: function( context, url ) {
        },
         */


        /**
         * Init and compile regex patterns for matching requests
         */
        initPatterns: function() {
            _dump( "initPatterns: initing patterns from prefs\n" );
            var userPattern = this.getPreference( "userPattern" );

            //this.cfg.defaultPattern = OmnibugProvider.getDefaultPattern().source;
            var that = this,
                patterns = [],
                providerPatterns = OmnibugProvider.getPatterns();

            Object.keys( providerPatterns ).forEach( function( provider ) {
                var enabled = that.getPreference( "provider." + provider );
                if( enabled ) {
                    patterns.push( providerPatterns[provider] );
                }
            } );
            this.cfg.defaultPattern = new RegExp( patterns.join( "|" ) ).source;
            this.cfg.defaultRegex = new RegExp( this.cfg.defaultPattern );

            if( userPattern ) {
                this.cfg.userRegex = new RegExp( userPattern );
            }

            // init highlight keys
            keyList = this.getPreference( "highlightKeys" );
            this.cfg.highlightKeys = {};
            if( keyList ) {
                var parts = keyList.split( "," );
                for( var part in parts ) {
                    if( parts.hasOwnProperty( part ) ) {
                        this.cfg.highlightKeys[parts[part]] = 1;
                    }
                }
            }
            _dump( "initPatterns: highlightKeys=" + Omnibug.Tools.objDump( this.cfg.highlightKeys ) + "\n" );

            // init watch keys
            keyList = this.getPreference( "watchKeys" );
            this.cfg.watchKeys = {};
            if( keyList ) {
                var parts = keyList.split( "," );
                for( var part in parts ) {
                    if( parts.hasOwnProperty( part ) ) {
                        this.cfg.watchKeys[parts[part]] = 1;
                    }
                }
            }
            _dump( "initPatterns: watchKeys=" + Omnibug.Tools.objDump( this.cfg.watchKeys ) + "\n" );
        },

        /**
         * Add the stylesheet
         * createStyleSheet() and addStyleSheet() are from Firebug
         */
        addStyleSheet: function( doc ) {
            // Make sure the stylesheet isn't appended twice.
            if( $( "omnibuStyles", doc ) ) {
                return;
            }

            var styleSheet = createStyleSheet( doc, "chrome://omnibug/skin/omnibug.css" );
            styleSheet.setAttribute( "id", "omnibugStyles" );
            addStyleSheet( doc, styleSheet );
        }

    } );
    Firebug.registerModule( Firebug.Omnibug );


    /**
     * NetProgress
     * @TODO: put in another file, but how to reference?
     */
    function OmNetProgress( context ) {
        //_dump( "OmNetProgress: instantiated\n" );
        this.context = context;
    }

    OmNetProgress.prototype = {
        stateIsRequest: false,
        onLocationChange: function() {},
        onProgressChange: function() {},
        onStatusChange : function() {},
        onSecurityChange : function() {},
        onLinkIconAvailable : function() {},

        QueryInterface: function( iid ) {
            if(    iid.equals( nsIWebProgressListener )
                || iid.equals( nsISupportsWeakReference )
                || iid.equals( nsISupports ) ) {
                return this;
            }

            throw Components.results.NS_NOINTERFACE;
        },

        /**
         * nsIWebProgressListener
         * @override
         */
        onStateChange: function( progress, request, flag, status ) {
            //_dump( "onStateChange: name=" + request.name + "; progress=" + progress + "; request=" + request + "; flag=" + flag + "; status=" + status + "\n" );

            var key, file, obj, now,
                omRef = Firebug.Omnibug;

            // capture the originating URL (e.g. of the parent page)
            if( ( flag & nsIWebProgressListener.STATE_IS_NETWORK ) &&
                ( flag & nsIWebProgressListener.STATE_START ) ) {
                this.context.omnibug.doneLoading = false;
            }

            // notice when parent document load is complete // @TODO: what happens if user clicks a beacon link before this point??
            if( ( flag & nsIWebProgressListener.STATE_IS_NETWORK ) &&
                ( flag & nsIWebProgressListener.STATE_STOP ) &&
                this.context.browser.currentURI.spec === request.name ) {
                this.context.omnibug.doneLoading = true;
            }


            // @TODO: is this the right order (default then user)?  Should we always be matching both?
            if( request.name.match( omRef.cfg.defaultRegex ) || ( omRef.cfg.userRegex && request.name.match( omRef.cfg.userRegex ) ) ) {

                now = new Date();
                key = Md5Impl.md5( request.name );

                if( flag & nsIWebProgressListener.STATE_START ) {
                    _dump( "onStateChange (context[" + this.context.uid + "]; browser[" + this.context.browser.uid + "]):\n\tname=" + request.name.substring( 0, 100 ) + "...\n\tflags=" + getStateDescription( flag ) + "\n\tkey=" + key + "\n\tparentUrl=" + this.context.browser.currentURI.spec + "\n\n" );

                    obj = {
                        key: key,
                        url: request.name,
                        parentUrl: this.context.browser.currentURI.spec,
                        doneLoading: this.context.omnibug.doneLoading,
                        timeStamp: now,
                        browser: this.context.browser,
                        statusText: null,
                        omnibugProvider: OmnibugProvider.getProviderForUrl( request.name )
                    };

                    // write the request to the panel.  must happen here so beacons will be shown (e.g., in realtime)
                    this.context.getPanel( "Omnibug" ).decodeUrl( obj );

                    /* Save requests in requests[] that need to be dumped on the next page (e.g. web beacons).  Only click events
                     * are candidates for saving, so only start saving after the context has loaded
                     * @TODO: investigate doneLoading vs. context.loaded
                     */
                    if( this.context.omnibug.loaded ) {
                        _dump( "onStateChange: adding request (key=" + obj.key + ") to module\n" );
                        omRef.cfg.requests[key] = obj;
                    }

                    // write to file, if defined
                    this.logToFile( now + "\t" + key + "\t" + request.name + "\t" + this.context.browser.currentURI.spec + "\n" );
                } else {
                    //_dump( "onStateChange: not start (" + getStateDescription( flag ) + "); key=" + key + "\n" );
                }
            }
            return 0;
        },

        /**
         * Append to the logfile, if we've got one and private browsing is not enabled
         */
        logToFile: function( msg ) {
            file = Firebug.Omnibug.cfg.outFile;
            if( file !== null && !( this.isPrivateBrowsing() ) ) {
                FileIO.write( file, msg, "a" );
            }
        },

        /**
         * Detect private browsing mode
         * Be cautious and only return false if we're *sure*
         */
        isPrivateBrowsing: function() {
            try {
                // Firefox 20+
                Components.utils.import( "resource://gre/modules/PrivateBrowsingUtils.jsm" );
                if( !PrivateBrowsingUtils.isWindowPrivate( window ) ) {
                    return false;
                }
            } catch( e ) {
                // pre Firefox 20
                try {
                    var inPrivateBrowsing = Components.classes["@mozilla.org/privatebrowsing;1"].
                                            getService( Components.interfaces.nsIPrivateBrowsingService ).
                                            privateBrowsingEnabled;
                    if( !inPrivateBrowsing ) {
                        return false;
                    }
                } catch( e ) {
                    Components.utils.reportError( e );
                }
            }
            return true;
        }

    };


    /*
     * local helpers
     */
    function getStateDescription( flag ) {
        var state = "";
        if( flag & nsIWebProgressListener.STATE_START ) {
            state += "STATE_START ";
        } else if( flag & nsIWebProgressListener.STATE_REDIRECTING ) {
            state += "STATE_REDIRECTING ";
        } else if( flag & nsIWebProgressListener.STATE_TRANSFERRING ) {
            state += "STATE_TRANSFERRING ";
        } else if( flag & nsIWebProgressListener.STATE_NEGOTIATING ) {
            state += "STATE_NEGOTIATING ";
        } else if( flag & nsIWebProgressListener.STATE_STOP ) {
            state += "STATE_STOP ";
        }

        if( flag & nsIWebProgressListener.STATE_IS_REQUEST )  { state += "STATE_IS_REQUEST "; }
        if( flag & nsIWebProgressListener.STATE_IS_DOCUMENT ) { state += "STATE_IS_DOCUMENT "; }
        if( flag & nsIWebProgressListener.STATE_IS_NETWORK )  { state += "STATE_IS_NETWORK "; }
        if( flag & nsIWebProgressListener.STATE_IS_WINDOW )   { state += "STATE_IS_WINDOW "; }
        if( flag & nsIWebProgressListener.STATE_RESTORING )   { state += "STATE_RESTORING "; }
        if( flag & nsIWebProgressListener.STATE_IS_INSECURE ) { state += "STATE_IS_INSECURE "; }
        if( flag & nsIWebProgressListener.STATE_IS_BROKEN )   { state += "STATE_IS_BROKEN "; }
        if( flag & nsIWebProgressListener.STATE_IS_SECURE )   { state += "STATE_IS_SECURE "; }
        if( flag & nsIWebProgressListener.STATE_SECURE_HIGH ) { state += "STATE_SECURE_HIGH "; }
        if( flag & nsIWebProgressListener.STATE_SECURE_MED )  { state += "STATE_SECURE_MED "; }
        if( flag & nsIWebProgressListener.STATE_SECURE_LOW )  { state += "STATE_SECURE_LOW "; }

        return state;
    }

    /**
     * Object.sizeof: implement Array-like length getter for Objects
     */
    Object.sizeof = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }



    /*
     * Omnibug.Tools
     * @TODO: move elsewhere? own file?
     */
    if( typeof Omnibug.Tools == "undefined" ) {
        Omnibug.Tools = {};
    }

    Omnibug.Tools.chooseLogFile = function( win ) {
        _dump( "chooseLogFile: win=" + win + "\n" );

        const nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = CC( "@mozilla.org/filepicker;1" ).createInstance( nsIFilePicker );
        fp.init( win, "Choose log file location", nsIFilePicker.modeSave );
        fp.defaultString = "omnibug.log";

        var rv = fp.show();
        if( rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace ) {
            var path = fp.file.path;
            _dump( "chooseLogFile: new path = " + path + "\n" );

            Firebug.Omnibug.setPreference( "logFileName", path );
            Firebug.Omnibug.setPreference( "enableFileLogging", true );

            _dump( "chooseLogFile: set new path; get=" + Firebug.Omnibug.getPreference( "logFileName" ) + "\n" );

            return true;
        }
        return false;
    }

    Omnibug.Tools.getFuncName = function( func ) {
        func = func.toString();
        var s = func.indexOf( " " ) + 1,
            e = func.indexOf( "(" ),
            name = func.substr( s, ( e - s ) );
        return( name ? name : "<anonymous>" );
    }

    Omnibug.Tools.objDump = function( obj ) {
        var str = "Object{ ";
        for( var key in obj ) {
            if( obj.hasOwnProperty( key ) ) {
                str += key + "=" + obj[key] + "; ";
            }
        }
        return str + "}";
    }

}} );
