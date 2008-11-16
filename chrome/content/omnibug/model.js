/* ***** BEGIN LICENSE BLOCK *****;
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Christoph Dorn.
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Christoph Dorn <christoph@christophdorn.com>
 *     Ross Simpson <simpsora@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * $Id$
 * $URL$
 */


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
            return Components.interfaces[ifaceName];
        }
    }

    // ************************************************************************************************
    // Constants

    try {
        const nsIWebProgressListener = CI( "nsIWebProgressListener" );
        const nsIWebProgress = CI( "nsIWebProgress" );
        const nsISupportsWeakReference = CI( "nsISupportsWeakReference" );
        const nsISupports = CI( "nsISupports" );
    } catch( ex ) {
        dump( ">>>   Error instantiating component interfaces: " + ex + "\n" );
    }

    const NOTIFY_STATE_DOCUMENT = nsIWebProgress.NOTIFY_STATE_DOCUMENT;
    const NOTIFY_ALL = nsIWebProgress.NOTIFY_ALL;

    const STATE_IS_WINDOW = nsIWebProgressListener.STATE_IS_WINDOW;
    const STATE_IS_DOCUMENT = nsIWebProgressListener.STATE_IS_DOCUMENT;
    const STATE_IS_REQUEST = nsIWebProgressListener.STATE_IS_REQUEST;
    const STATE_START = nsIWebProgressListener.STATE_START;
    const STATE_STOP = nsIWebProgressListener.STATE_STOP;
    const STATE_TRANSFERRING = nsIWebProgressListener.STATE_TRANSFERRING;


    Firebug.Omnibug = extend( Firebug.Module, {
        requests: {},
        messages: [],
        contextLoaded: false,
        outFile: null,
        latestOmnibugContext: null,
        win: null,
        defaultRegex: null,
        userRegex: null,
        usefulKeys: {},
        highlightKeys: {},
        alwaysExpand: false,
        prefsService: null,
        showQuotes: false,

        /**
         * Called when the browser exits
         * @override
         */
        shutdown: function() {
            dump( ">>>   shutdown\n" );
            if( Firebug.getPref( 'defaultPanelName' ) === 'Omnibug' ) {
                Firebug.setPref( 'defaultPanelName', 'console' );
            }
        },

        /**
         * Called when panels are selected
         * @override
         */
        showPanel: function( browser, panel ) {
            dump( ">>>   showPanel: browser=" + browser + "; panel=" + panel + "\n" );
            var isOmnibug = panel && panel.name === "Omnibug";
            var OmnibugButtons = browser.chrome.$( "fbOmnibugButtons" );
            collapse( OmnibugButtons, !isOmnibug );
        },

        /**
         * Called when the clear button is pushed
         */
        clearPanel: function() {
            FirebugContext.getPanel("Omnibug").clear();
        },

        /**
         * Initialize the preferences service
         */
        initPrefsService: function() {
            try {
                this.prefsService = CC( '@mozilla.org/preferences-service;1' )
                                      .getService( CI( "nsIPrefService" ) )
                                      .getBranch( "extensions.omnibug." );

                this.prefsService.QueryInterface( CI( "nsIPrefBranchInternal" ) );

                // add prefs observer
                this.prefsService.addObserver( "", this, false );
            } catch( ex ) {
                dump( ">>>   initPrefsService: error getting prefs service: " + ex + "\n" );
            }
        },

        /**
         * Gets a preference from the preference service
         */
        getPreference: function( key ) {
            switch( this.prefsService.getPrefType( key ) ) {
                case Components.interfaces.nsIPrefBranch.PREF_STRING:
                    return this.prefsService.getCharPref( key );
                case Components.interfaces.nsIPrefBranch.PREF_INT:
                    return this.prefsService.getIntPref( key );
                case Components.interfaces.nsIPrefBranch.PREF_BOOL:
                    return this.prefsService.getBoolPref( key );
            }
        },

        /**
         * Sets a preference
         */
        setPreference: function( key, val ) {
            switch( this.prefsService.getPrefType( key ) ) {
                /*
                case Components.interfaces.nsIPrefBranch.PREF_STRING:
                    this.prefsService.setCharPref( key, val);
                    break;
                */
                case Components.interfaces.nsIPrefBranch.PREF_INT:
                    this.prefsService.setIntPref( key, val );
                    break;
                case Components.interfaces.nsIPrefBranch.PREF_BOOL:
                    this.prefsService.setBoolPref( key, val );
                    break;
                default:
                    this.prefsService.setCharPref( key, val);
                    break;
            }
        },


        /**
         * Called once, at browser startup
         * @override
         */
        initialize: function() {
            dump( ">>>   initialize: arguments=" + arguments + "\n" );

            this.initPrefsService();

            // set default pref
            if( this.prefsService.prefHasUserValue( "defaultPattern" ) ) {
                this.prefsService.clearUserPref( "defaultPattern" );
            }

            // initialize prefs
            this.initPrefs();
        },

        /**
         * Initialize prefs
         *   this is called by initialize(), as well by the prefs observer service
         */
        initPrefs: function() {
            dump( ">>>   initPrefs: (re)initializing preferences\n" );

            // always expand preference
            this.alwaysExpand = this.getPreference( "alwaysExpand" );

            // quotes around values pref
            this.showQuotes = this.getPreference( "showQuotes" );

            // init logging
            this.initLogging();

            // init request-matching patterns
            this.initPatterns();
        },


        /**
         * Preferences observer handler
         */
        observe: function( subject, topic, key ) {
            dump( ">>>   observe: subject='" + subject + "'; topic='" + topic + "'; key='" + key + "'; value='" + this.getPreference( key ) + "'\n" );

            if( topic !== "nsPref:changed" ) {
                return;
            }

            var newValue = this.getPreference( key );

            switch( key ) {
                case "alwaysExpand":
                    this.alwaysExpand = newValue;
                    break;

                case "showQuotes":
                    this.showQuotes = newValue;
                    break;

                case "enableFileLogging":
                case "logFileName":
                    this.initLogging();
                    break;

                //case "defaultPattern":
                case "userPattern":
                case "usefulKeys":
                case "highlightKeys":
                    this.initPatterns();
                    break;
            }
        },


        /**
         * Init logging behavior
         */
        initLogging: function() {
            dump( ">>>   initLogging: arguments=" + arguments + "\n" );

            var fileOutput = this.getPreference( "enableFileLogging" );
            dump( ">>>   initLogging: fileOutput=" + fileOutput + "\n" );
            if( fileOutput ) {
                var prefFile;
                try {
                    prefFile = this.getPreference( "logFileName" );
                } catch( ex ) {}

                try {
                    if( prefFile ) {
                        dump( ">>>   initLogging: enabling logging to " + prefFile + "\n" );
                        this.outFile = FileIO.open( prefFile );
                    } else {
                        dump( ">>>   initLogging: enabling logging to default log file\n" );
                        var path = FileIO.getTmpDir();
                        var fn = "omnibug.log";
                        this.outFile = FileIO.append( path, fn );
                    }

                    var msg = "File logging enabled; requests will be written to " + this.outFile.path;
                    dump( ">>>   initLogging: " + msg + "\n" );
                    this.messages.push( msg );
                } catch( ex ) {
                    dump( ">>>   initLogging: unable to create output file: " + ex + "\n" );
                }
            } else {
                dump( ">>>   initLogging: logging is disabled.\n" );
                this.outFile = null;
            }
        },

        /**
         * Called when new page is going to be rendered
         * @override
         */
        initContext: function( context ) {
            dump( ">>>   initContext: context=" + context + "\n" );
            this.monitorContext( context );
        },

        /**
         * Called just before old page is thrown away;
         * @override
         */
        destroyContext: function( context ) {
            dump( ">>>   destroyContext: context=" + context + "\n" );

            this.latestOmnibugContext = undefined;
            this.contextLoaded = false;
            if( context.omNetProgress ) {
                this.unmonitorContext( context );
            }
        },

        /**
         * Called when ANY page is completely finished loading
         * @override
         */
        loadedContext: function( context ) {
            dump( ">>>   loadedContext: context=" + context + "\n" );
/*
            try {
                for( el in context ) {
                    var val = context[el];
                    if( ! context[el].toString().match( /^function/ ) ) {
                        dump( "'" + el +"'='" + val + "'\n" );
                    }
                }
            } catch( ex ) {}

            dump( "---   window.loc='" + context.window.location + "'\n" );
*/

            /*
             * this seems like a total hack, but it fixed the immediate problem (maybe due to timing?)
             * loadedContext is called when any page is done loading, including pages in other tabs (weird).
             * a page that was loading in another tab had a location of about:blank, which was causing processRequests() to fire and dump the request from the original tab (thereby duplicating the entry)
             * this logic is probably not quite right (we shouldn't be paying attention to other tab's load events)
             */
            if( ! context.window.location.match( /^http/ ) ) {
                return;
            }

            // Makes detach work.
            if ( ! context.omnibugContext && this.latestOmnibugContext ) {
                context.omnibugContext = this.latestOmnibugContext;
            }

            this.contextLoaded = true;

            // dump any messages waiting
            while( this.messages.length ) {
                FirebugContext.getPanel("Omnibug").printLine( this.messages.shift() );
            }

            //dump( ">>>   loadedContext: calling processRequests\n" );
            this.processRequests();
        },

        /**
         * ?
         * @override
         */
        reattachContext: function( context ) {
            dump( ">>>   reattachContext: context=" + context + "\n" );

            // Makes detach work.
            if ( ! FirebugContext.getPanel( "Omnibug" ).document.omnibugContext ) {
                // Save a pointer back to this object from the iframe's document:
                FirebugContext.getPanel( "Omnibug" ).document.omnibugPanel = FirebugContext.getPanel( "Omnibug" );
                FirebugContext.getPanel( "Omnibug" ).document.omnibugContext = FirebugContext.omnibugContext;
            }
        },

        /**
         * Called as page is rendering (?)
         * @override
         */
        showContext: function( browser, context ) {
            dump( ">>>   showContext: browser=" + browser + "; context=" + context + "\n" );
        },

        /**
         * ?
         * @override
         */
        watchContext: function( win, context, isSystem ) {
            dump( ">>>   watchContext: win=" + win + "; context=" + context + "; isSystem=" + isSystem + "\n" );
        },

        /**
         * not override
         */
        monitorContext: function( context ) {
            dump( ">>>   monitorContext: context=" + context + "\n" );
            if( !context.omNetProgress ) {
                context.omNetProgress = new OmNetProgress( context );
                context.browser.addProgressListener( context.omNetProgress, NOTIFY_ALL );
            }
        },

        /**
         * not override
         */
        unmonitorContext: function( context ) {
            //dump( ">>>   unmonitorContext: context=" + context + "\n" );
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
            dump( ">>>   unwatchWindow: context=" + context + "; win=" + win + "\n" );
            this.win = null;
        },

        /**
         * Called when a new page is going to be watched (?)
         * @override
         */
        watchWindow: function( context, win ) {
            dump( ">>>   watchWindow: win=" + win + "; context=" + context + "\n" );
            this.win = win; // @TODO: not sure 'this' is the right place for the window reference
        },

        /**
         * Called by loadedContext to process the requests object and write to panel
         */
        processRequests: function() {
            dump( ">>>   processRequests: processing " + Object.size( this.requests ) + " requests\n" );
            for( var key in this.requests ) {
                //dump( "---   key=" + key + "\n" );
                if( this.requests.hasOwnProperty( key ) ) {
                    dump( "---   processRequests: processing " + key + "\n" );
                    this.requests[key]["src"] = "prev";
                    dump( "---   processRequests: calling decodeUrl\n" );
                    FirebugContext.getPanel( "Omnibug" ).decodeUrl( this.requests[key] );
                    delete this.requests[key];
                } else {
                    dump( ">>>   processRequests: not my key!\n" );
                }
            }
            dump( "<<<   processRequests: done\n" );
        },

        /**
         * Tools menu handler
         */
        omnibugTools: function( menuitem ) {
            dump( ">>>   omnibugTools: label=" + menuitem.label + "\n" );

            if( menuitem.label === "Choose log file" ) {
                if( Omnibug.Tools.chooseLogFile( this.win ) ) {
                    // successfully picked a log file
                    dump( ">>>   omnibugTools: logFileName=" + this.getPreference( "logFileName" ) + "\n" );
                }
            }
        },

        /**
         * Init and compile regex patterns for matching requests
         */
        initPatterns: function() {
            dump( ">>>   initPatterns: initing patterns from prefs\n" );
            var defaultPattern = this.getPreference( "defaultPattern" ),
                userPattern = this.getPreference( "userPattern" );

            this.defaultRegex = new RegExp( defaultPattern );

            if( userPattern ) {
                this.userRegex = new RegExp( userPattern );
            }

            // init useful keys
            var keyList = this.getPreference( "usefulKeys" );
            if( keyList ) {
                var parts = keyList.split( "," );
                for( var part in parts ) {
                    if( parts.hasOwnProperty( part ) ) {
                        this.usefulKeys[parts[part]] = 1;
                    }
                }
            }
            dump( ">>>   initPatterns: usefulKeys=" + Omnibug.Tools.objDump( this.usefulKeys ) + "\n" );

            // init highlight keys
            keyList = this.getPreference( "highlightKeys" );
            if( keyList ) {
                var parts = keyList.split( "," );
                for( var part in parts ) {
                    if( parts.hasOwnProperty( part ) ) {
                        this.highlightKeys[parts[part]] = 1;
                    }
                }
            }
            dump( ">>>   initPatterns: highlightKeys=" + Omnibug.Tools.objDump( this.highlightKeys ) + "\n" );
        }

    } );
    Firebug.registerModule( Firebug.Omnibug );


    /**
     * NetProgress
     * @TODO: put in another file, but how to reference?
     */
    function OmNetProgress( context ) {
        dump( ">>>   OmNetProgress: instantiated\n" );
        this.context = context;
    }

    OmNetProgress.prototype = {
        that: this,
        seenReqs: {},
        parentUrl: null,
        doneLoading: false,
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
            //dump( ">>>   onStateChange: name=" + request.name + "; progress=" + progress + "; request=" + request + "; flag=" + flag + "; status=" + status + "\n" );
            var key, file, obj, now,
                omRef = Firebug.Omnibug;

            // capture the originating URL (e.g. of the parent page)
            if( ( flag & nsIWebProgressListener.STATE_IS_NETWORK ) &&
                ( flag & nsIWebProgressListener.STATE_START ) ) {
                this.that.parentUrl = request.name; // @TODO: still not sure that this is right
                this.that.doneLoading = false;
            }

            // notice when parent document load is complete // @TODO: what happens if user clicks a beacon link before this point??
            if( ( flag & nsIWebProgressListener.STATE_IS_NETWORK ) &&
                ( flag & nsIWebProgressListener.STATE_STOP ) &&
                this.that.parentUrl === request.name ) {
                this.that.doneLoading = true;
            }

            // @TODO: is this the right order (default then user)?  Should we always be matching both?
            if( request.name.match( omRef.defaultRegex ) || ( omRef.userRegex && request.name.match( omRef.userRegex ) ) ) {
                //dump( ">>>   onStateChange pattern match: key=" + Md5Impl.md5( request.name ) + " (" + request.name.substring( 0, 75 ) + ")" + "\n" );

                now = new Date();
                if( ! this.seenReqs[request.name] ) {
                    this.seenReqs[request.name] = true;

                    key = Md5Impl.md5( request.name );
                    dump( ">>>   onStateChange:\n>>>\tname=" + request.name.substring( 0, 100 ) + "...\n>>>\tflags=" + getStateDescription( flag ) + "\n>>>\tmd5=" + key + "\n>>>\tparentUrl=" + this.that.parentUrl + "\n\n" );

                    obj = {
                        key: key,
                        url: request.name,
                        parentUrl: this.that.parentUrl,
                        doneLoading: this.that.doneLoading,
                        timeStamp: now
                    };


                    // write the request to the panel.  must happen here so beacons will be called (e.g., in realtime)
                    dump( "---   onStateChange: calling decodeUrl\n" );
                    FirebugContext.getPanel( "Omnibug" ).decodeUrl( obj );

                    // add to requests object only if the context has been loaded (e.g. dump requests added from the previous page)
                    if( omRef.contextLoaded ) {
                        dump( ">>>   onStateChange: adding request to request list: " + Omnibug.Tools.objDump( omRef.requests ) + "\n" );
                        omRef.requests[key] = obj;
                    }

                    // write to file, if defined
                    file = omRef.outFile;
                    if( file !== null ) {
                        FileIO.write( file, now + "\t" + key + "\t" + request.name + "\t" + this.that.parentUrl + "\n", "a" );
                    }
                }
            }
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
     * Object.size: implement Array-like length getter for Objects
     */
    Object.size = function(obj) {
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
        dump( ">>>   chooseLogFile: win=" + win + "\n" );

        const nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = CC( "@mozilla.org/filepicker;1" ).createInstance( nsIFilePicker );
        fp.init( win, "Choose log file location", nsIFilePicker.modeSave );
        fp.defaultString = "omnibug.log";

        var rv = fp.show();
        if( rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace ) {
            var path = fp.file.path;
            dump( ">>>   chooseLogFile: new path = " + path + "\n" );

            Firebug.Omnibug.setPreference( "logFileName", path );
            Firebug.Omnibug.setPreference( "enableFileLogging", true );

            dump( ">>>   chooseLogFile: set new path; get=" + Firebug.Omnibug.getPreference( "logFileName" ) + "\n" );

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

    Omnibug.Tools.recObjDump = function( obj ) {
        try {
            var str = "Object{ ";
            for( var key in obj ) {
                str += "\tkey" + "=" + obj[key] + "\n";
                //if( obj[key].match( /\[Object\]/ ) ) {
                    //str += recObjDump( obj[key] );
                //}
            }
            return str + "}";
        } catch( ex ) {
            dump( "*** recObjDump: exception: " + ex + "\n" );
        }
    }

}} );
