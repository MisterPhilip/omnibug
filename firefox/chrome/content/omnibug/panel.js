/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if( typeof FBL === "undefined" ) {
    FBL = { ns: function() {} }
}


FBL.ns( function() { with( FBL ) {
    function pad( n ) {
        return '' + ( n <= 9 ? "00" : n <= 99 ? "0" : '' ) + n;
    }
    function _dump( str ) {
        var d = new Date();
        dump( d.toLocaleTimeString() + "." + pad( d.getMilliseconds() ) + ":  " + str );
    }


    /*
     * Common functions for use in panel
     * Note: call these functions like:
     *    func.call( this, arg1, arg2 );
     */

    // returns true when the given name is in the wachKeys list
    function _isWatched( elName ) {
        return this.omRef.cfg.watchKeys[elName];
    }

    // returns true when the given name is in the highlightKeys list
    function _isHighlightable( elName ) {
        return this.omRef.cfg.highlightKeys[elName];
    }

    // returns true when the given name is in the usefulKeys list
    function _isUseful( elName ) {
        return this.omRef.cfg.usefulKeys[elName];
    }

    // returns the title (if any) for a given key
    function _getTitleForKey( elName ) {
        return this.omRef.cfg.keyTitles[elName];
    }

    /**
     * Adds dynamic style rules (from prefs) to the caller's document
     */
    function _initDynamicStyles() {
        var styleObject = this.document.styleSheets[this.document.styleSheets.length - 1];
        styleObject.insertRule( "table.load { background-color: " + this.omRef.cfg.color_load + "}", styleObject.cssRules.length );
        styleObject.insertRule( "table.click { background-color: " + this.omRef.cfg.color_click + "}", styleObject.cssRules.length );
        styleObject.insertRule( "table.prev { background-color: " + this.omRef.cfg.color_prev + "}", styleObject.cssRules.length );
        styleObject.insertRule( "table.req .hilite { background-color: " + this.omRef.cfg.color_hilite + "}", styleObject.cssRules.length );
        styleObject.insertRule( "table.req span.qq { color: " + this.omRef.cfg.color_quotes + "}", styleObject.cssRules.length );
        styleObject.insertRule( "table.ent tr:hover { background-color: " + this.omRef.cfg.color_hover + "}", styleObject.cssRules.length );
    }


    /**
     * Create an HTML element
     *
     * @param elType type of element to create
     * @param attrs object of attibute:value pairs to set on element
     * @param parentNode append created element to this element, if set
     * @textChild text value to append to child, if any
     */
    function _createElement( elType, attrs, parentNode, textChild ) {
        var el = this.document.createElement( elType );
        for( var attr in attrs ) {
            if( attrs.hasOwnProperty( attr ) ) {
                el.setAttribute( attr, attrs[attr] );
            }
        }

        if( !! textChild ) {
            el.appendChild( this.document.createTextNode( textChild ) );
        }

        if( !! parentNode ) {
            parentNode.appendChild( el );
        }

        return el;
    }


    /**
     * Wrap a value in colored quotes
     *
     * @param val value to quote
     */
    function _quoteValue( val, parentNode ) {
        elems = [];
        if( this.omRef.cfg.showQuotes ) {
            var os1 = _createElement.call( this, "span", { class: "qq" }, null, '"' );
            elems.push( os1 );

            var is = _createElement.call( this, "span", { class: "v" }, null, val );
            elems.push( is );

            var os2 = _createElement.call( this, "span", { class: "qq" }, null, '"' );
            elems.push( os2 );
        } else {
            elems.push( this.document.createTextNode( val ) );
        }

        if( !! parentNode ) {
            elems.forEach( function( el ) {
                parentNode.appendChild( el );
            } );
        }

        return elems;
    }


    /**
     * Given a delimited string, return a map of key => 1
     * @param str the delimited string
     * @return the map
     */
    function _delimStringToObj( str ) {
        var obj = {},
            str = ( str ? str : "" ),
            keys = str.split( /, ?/ );
        for( var idx in keys ) {
            obj[keys[idx]] = 1;
        }
        return obj;
    }


    /**
     * Given an object, return a delimited string of the keys
     * @param obj the object
     * @return the delimited string
     */
    function _objToDelimString( obj ) {
        var str = "";
        for( var key in obj ) {
            if( obj.hasOwnProperty( key ) && !! key ) {
                str += key + ",";
            }
        }
        return str.replace( /,$/, "" );
    }

    /**
     * Remove the given key from the given pref list
     * @param key key to remove
     * @param pref pref list to remove from
     */
    function _removeFromPrefList( key, pref ) {
        _dump( "removeFromWatches: key='" + key + "'; pref='" + pref + "'\n" );
        var currPrefs = _delimStringToObj( this.omRef.getPreference( pref ) );
        delete( currPrefs[key] );
        this.omRef.setPreference( pref, _objToDelimString( currPrefs ) );
    }


    /**
     * Add the given key to the given pref list
     * @param key the key to add
     * @param pref the pref list to add to
     */
    function _addToPrefList( key, pref ) {
        //_dump( "addToWatches: ctx='" + ctx + "'; key='" + key + "'; pref='" + pref + "'\n" );
        var currPrefs = _delimStringToObj( this.omRef.getPreference( pref ) );
        currPrefs[key] = 1;
        this.omRef.setPreference( pref, _objToDelimString( currPrefs ) );

        // refresh?
    }


    /**
     * The panel object
     */
    function OmnibugPanel() {}
    OmnibugPanel.prototype = extend( Firebug.Panel, {
        name: "Omnibug",
        title: "Omnibug",
        searchable: false,
        editable: false,
        htmlOutput: true,
        dataSent: false,
        dependents: [ "OmnibugSide" ],
        omRef: Firebug.Omnibug,

        /**
         * Initialize the panel. This is called when the Panel is activated and
         * whenever the browser document changes (new URL, reload).
         * @override
         */
        initialize: function( context, doc ) {
            Firebug.Panel.initialize.apply( this, arguments );
            Firebug.Omnibug.addStyleSheet( this.document );

            this.context = context;
            this.document = doc;
            this.panelNode = doc.createElement( "div" );
            this.panelNode.ownerPanel = this;
            this.panelNode.className = "panelNode";
            doc.body.appendChild( this.panelNode );

            //_dump( "panel initialize: arguments=" + arguments + "\n" );
            if ( context.omnibugContext ) {
                _dump( "panel initialize: context already exists\n" );
                return;
            }

            // Create a context for this instance.
            context.omnibugContext = new Omnibug.OmnibugContext( this );

            this.document.omnibugPanel = this;
            this.document.omnibugContext = context.omnibugContext;

            _initDynamicStyles.call( this );
        },

        getContext: function() {
            return this.context;
        },

        /*
         * Called whenever the panel comes into view. Like toggling between browser tabs.
         * @override
         */
        show: function() {
            //_dump( "show: arguments=" + arguments + "\n" );

            this.latestOmnibugContext = this.getContext().omnibugContext;  // save this to make detach work

            // There is only ONE DOCUMENT shared by all browser tabs. So if the user opens two
            // browser tabs, we have to restore the appropriate context when switching between tabs.
            this.document.omnibugContext = this.getContext().omnibugContext;
        },

        clear: function() {
            /*
            var tables = this.panelNode.getElementsByTagName( "table" );
            for( var i=0; i<tables.length; ++i ) {
                //tables[i].parentNode.removeChild( tables[i] ); // doesn't work for some reason
                // @TODO: really should remove these for memory's sake
                tables[i].style.display = "none";
            }
            */

            /*
             * works better than the above.  still have to click clear more than once occasionally.. not sure why this is.
             * using this.panelNode.parentNode removes too much; subsequent requests without a page refresh won't get logged.
             */
            var el = this.panelNode;
                    for( var i=0; i<el.childNodes.length; ++i ) {
                el.removeChild( el.childNodes[i] );
            }
        },


        /**
         * Receives a data object from the model, decodes it, and passes it on to report()
         */
        decodeUrl: function( data ) {
            _dump( "decodeUrl: processing key=" + data.key + " (doneLoading=" + data.doneLoading + ")\n" );
            //_dump( "decodeUrl: processing key=" + data.key + " (caller: " + Omnibug.Tools.getFuncName( arguments.callee.caller ) + ")\n" );

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

                    if( that.omRef.cfg.usefulKeys[n] ) {
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

            obj = this.augmentData( obj );
            try {
                this.report( obj );
            } catch( ex ) {
                _dump( "decodeUrl: exception in report(): " + ex + "\n" );
            }
        },


        /**
         * Augments the data object with summary data
         * @param data the data object
         * @return the augmented data object
         */
        augmentData: function( data ) {
            data["omnibug"] = {};

            // workaround -- kill it when vendor-specific code in place
            var eventType = ( data.state.doneLoading ? "click" : "load" ),
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
                _dump( "report: found Omniture 'pe' parameter; resetting eventType (was=" + oldEventType + "; now=" + eventType + ")\n" );
            }

            data.omnibug["Key"]        = data.raw["Key"]        = data.state.key;
            data.omnibug["Event"]      = data.raw["Event"]      = eventType;
            data.omnibug["Timestamp"]  = data.raw["Timestamp"]  = data.state.timeStamp;
            data.omnibug["Provider"]   = data.raw["Provider"]   = provider;
            data.omnibug["Source"]     = data.raw["Source"]     = ( data.state.src === "prev" ? "Previous page" : "Current page" );
            data.omnibug["Parent URL"] = data.raw["Parent URL"] = data.state.parentUrl;
            data.omnibug["Full URL"]   = data.raw["Full URL"]   = data.state.url
                                                                  + " (" + urlLength + " characters"
                                                                  + ( urlLength > 2083 ? ", *** too long for IE6/7! ***" : "" )
                                                                  + ")";

            return data;
        },


        /**
         * Return a word that's camelCapped
         */
        camelCapser: function( str ) {
            return str.replace( /\b(.)/, function( m, $1 ) { return $1.toUpperCase() } );
        },


        /**
         * Generate and output an event report in HTML format
         * @param data the data object to report on
         */
        report: function( data ) {
            var expanderImage, expanderClass;
            if( this.omRef.cfg.alwaysExpand ) {
                expanderClass = "reg";
                expanderImage = "twistyOpen.png";
            } else {
                expanderClass = "hid";
                expanderImage = "twistyClosed.png";
            }

            var table = _createElement.call( this, "table", {
                cellspacing: 0,
                border: 0,
                class: "req " + data.omnibug.Event + ( data.state.src ? " " + data.state.src : "" ),
                id: "ob_" + data.state.key
            }, this.panelNode );

            var tr = _createElement.call( this, "tr", {}, table );

            var td = _createElement.call( this, "td", {
                class: "exp"
            }, tr );

            var a = _createElement.call( this, "a", {
                href: "#"
            }, td );
            a.addEventListener( "click", this.document.omnibugContext.toggle );

            _createElement.call( this, "img", {
                src: "chrome://omnibug/skin/" + expanderImage 
            }, a );

            var std = _createElement.call( this, "td", {
                class: "summ"
            }, tr );

            var p = _createElement.call( this, "p", {
                class: "summary"
            }, std );

            _createElement.call( this, "strong", {}, p, this.camelCapser( data.omnibug.Event ) + " event" );

            var str = ( data.state.src === "prev" ? " (previous page)" : "" ) + " | "
                    + data.omnibug.Provider + " | "
                    + data.state.timeStamp + " | "
                    + data.state.key
                    + ( data.state.statusText != null ? " | " + data.state.statusText : "" )
            p.appendChild( this.document.createTextNode( str ) );

            var exp = _createElement.call( this, "div", {
                class: expanderClass
            }, std );

            var tblCont = _createElement.call( this, "table", {
                class: "ent"
            }, exp );

            this.generateReportFragment( data.omnibug, "Summary", tblCont );      // summary values
            this.generateReportFragment( data.props, "Props", tblCont );          // omniture props
            this.generateReportFragment( data.vars, "eVars", tblCont );           // omniture eVars
            this.generateReportFragment( data.useful, "Useful", tblCont );        // useful params
            this.generateReportFragment( data.moniforce, "Moniforce", tblCont );  // moniforce params
            this.generateReportFragment( data.webtrends, "WebTrends", tblCont );  // webtrends params
            this.generateReportFragment( data.other, "Other", tblCont );          // everything else

            var sp = this.getContext().getPanel("OmnibugSide");
            sp.updateWatches( data );

            _dump( "report: wrote entry for " + data.state.key + "\n" );
        },


        /**
         * Generate an HTML report fragment for the given section
         */
        generateReportFragment: function( data, title, parent ) {
            var cn, kt,
                i = 0,
                rows = [];
            
            for( var el in data ) {
                if( data.hasOwnProperty( el ) && !! data[el] ) {
                    cn = _isHighlightable.call( this, el ) ? "hilite" : "";
                    kt = _getTitleForKey.call( this, el );

                    var tr = _createElement.call( this, "tr", { class: cn } );
                    var td = _createElement.call( this, "td", {
                         class: "k " + ( i++ % 2 === 0 ? 'even' : 'odd' ),
                         title: ( !! kt ? kt : "" )
                    }, tr, el );

                    var tdVal = _createElement.call( this, "td", { class: "v" }, tr );

                    _quoteValue.call( this, data[el], tdVal );

                    rows.push( tr );
                }
            }

            if( rows.length > 0 ) {
                var thead = _createElement.call( this, "thead" );
                var tr = _createElement.call( this, "tr", {}, thead );
                var th = _createElement.call( this, "th", {
                  colspan: 2
                }, tr, title );

                parent.appendChild( thead );

                var tbody = _createElement.call( this, "tbody", { class: title.toLowerCase() } );
                rows.forEach( function( row ) { 
                    tbody.appendChild( row );
                } );
                parent.appendChild( tbody );
            }
        },


        /**
         * Update an entry for the given key in the panel with status text received from the model
         * @param key  request key
         * @param statusText  new status text
         *
         * @TODO: will it ever happen that the status field is already written at this point?
         */
        updateEntryState: function( key, statusText ) {
            var p,
                span,
                tbl = this.document.getElementById( "ob_" + key );

            if( tbl ) {
                p = tbl.getElementsByTagName( "p" );
                if( p ) {
                    span = _createElement.call( this, "span", {}, p[0], " | " + statusText );
                }
            }
        },


        // Options menu

        /**
         * Called every time the options menu is opened
         * @override
         */
        getOptionsMenuItems: function() {
            return [
                this.optionMenu( "Enable File Logging", "enableFileLogging" ),
                this.optionMenu( "Always expand entries", "alwaysExpand" ),
                this.optionMenu( "Surround values with quotes", "showQuotes" )
            ];
        },

        /**
         * Return an option menu item
         * @override
         */
        optionMenu: function( label, option ) {
            var value = this.omRef.getPreference( option ),
                _omRef = this.omRef,
                updatePref = function( key, val ) {
                    _omRef.setPreference( key, val );
                };
            // bindFixed is from Firebug. It helps to pass the args along.
            return { label: label, nol10n: true, type: "checkbox", checked: value, command: bindFixed( updatePref, Firebug, option, !value ) }
        },

        getContextMenuItems: function( style, target ) {
            var val, tr,
                node = target,
                items = [];

            while( node && node.tagName.toUpperCase() !== "TR" ) {
                node = node.parentNode;
            }
            tr = node;

            // get a handle to the tbody element, so we can use the className element later
            tbody = node;
            while( tbody && tbody.tagName.toUpperCase() !== "TBODY" ) {
                tbody = tbody.parentNode;
            }

            node = node.getElementsByTagName( "td" )[0];
            if( node ) {
                val = node.firstChild.nodeValue;
                if( val ) {
                    // watch
                    if( _isWatched.call( this, val ) ) {
                        items.push( "-", { label: "Unwatch '" + val + "'", command: bind( this.removePrefAndUpdateWatches, this, val, "watchKeys" ) } );
                    } else {
                        items.push( "-", { label: "Watch '" + val + "'", command: bind( this.addPref, this, val, "watchKeys" ) } );
                    }

                    // highlight
                    if( _isHighlightable.call( this, val ) ) {
                        items.push( "-", { label: "Unhighlight '" + val + "'", command: bind( this.removePref, this, val, "highlightKeys", tr ) } );
                    } else {
                        items.push( "-", { label: "Highlight '" + val + "'", command: bind( this.addPref, this, val, "highlightKeys", tr ) } );
                    }

                    // useful
                    if( tbody && tbody.className && ! tbody.className.match( /\bsummary\b/ ) ) {
                        if( _isUseful.call( this, val ) ) {
                            items.push( "-", { label: "Remove '" + val + "' from Useful group", command: bind( this.removePref, this, val, "usefulKeys" ) } );
                        } else {
                            items.push( "-", { label: "Add '" + val + "' to Useful group", command: bind( this.addPref, this, val, "usefulKeys" ) } );
                        }
                    }
                }
            }

            return items;
        },

        /**
         * Helper function to remove a pref and update the watches panel
         * @param ctx context from ctx menu helper
         * @param key key to remove
         * @param pref pref list to remove from
         */
        removePrefAndUpdateWatches: function( ctx, key, pref ) {
            _removeFromPrefList.call( this, key, pref );
            var sp = this.getContext().getPanel("OmnibugSide");
            sp.updateWatches( null, "remove", key );
        },

        /**
         * Helper function to remove a pref
         * @param ctx context from ctx menu helper
         * @param key key to remove
         * @param pref pref list to remove from
         * @param el optional element to modify
         */
        removePref: function( ctx, key, pref, el ) {
            _removeFromPrefList.call( this, key, pref );
            // unhighlight
            if( pref === "highlightKeys" && el && el.className ) {
                el.className = el.className.replace( "hilite", "" );
            }
        },

        /**
         * Helper function to add a pref
         * @param ctx context from ctx menu helper
         * @param key key to add
         * @param pref pref list to add to
         * @param el optional element to modify
         */
        addPref: function( ctx, key, pref, el ) {
            _addToPrefList.call( this, key, pref );
            if( pref === "highlightKeys" && el ) {
                el.className += ( el.className ? " " : "" ) + "hilite";
            }
        }

    } );
    Firebug.registerPanel( OmnibugPanel );


    function OmnibugSidePanel() {}
    OmnibugSidePanel.prototype = extend( Firebug.Panel, {
        name: "OmnibugSide",
        title: "Watches",
        searchable: false,
        editable: false,
        htmlOutput: true,
        dataSent: false,
        omRef: Firebug.Omnibug,
        parentPanel: "Omnibug",

        initialize: function( context, doc ) {
            Firebug.Panel.initialize.apply(this, arguments);
            Firebug.Omnibug.addStyleSheet( this.document );

            this.document = doc;
            this.panelNode = doc.createElement( "div" );
            this.panelNode.ownerPanel = this;
            this.panelNode.className = "panelNode";
            doc.body.appendChild( this.panelNode );

            _initDynamicStyles.call( this );

            _dump( "OmnibugSidePanel: inited\n" );
        },

        getContextMenuItems: function( style, target ) {
            var val,
                node = target,
                items = [];

            while( node && node.tagName.toUpperCase() !== "TR" ) {
                node = node.parentNode;
            }
            node = node.getElementsByTagName( "td" )[0];
            if( node ) {
                val = node.firstChild.nodeValue;
                if( val ) {
                    items.push( "-", { label: "Unwatch '" + val + "'", command: bind( this.removePrefAndUpdateWatches, this, val, "watchKeys" ) } );
                }
            }

            return items;
        },

        /**
         * Helper function to remove a pref, then update the watch window
         */
        removePrefAndUpdateWatches: function( ctx, key, pref ) {
            _removeFromPrefList.call( this, key, pref );
            this.updateWatches( null, "remove", key );
        },



        /**
         * Update the values (if any) in the watches side-panel
         * @param data the data object
         * @param mode if mode=remove, just remove 'key' from the table
         *             otherwise operate in add/update mode:
         * @param remKey the key to remove when mode=remove
         */
        updateWatches: function( data, mode, remKey ) {
            var existingVals = {},
                tbl = this.document.getElementById( "watchTbl" );

            if( tbl ) {
                //_dump( "updateWatches: found existing table (" + tbl + ")\n" );

                // create a map of existing values
                var cells, keyCell, valCell, key, val,
                    rows = tbl.getElementsByTagName( "tr" );
                for( row in rows ) {
                    if( !! row && rows.hasOwnProperty( row ) ) {
                        cells = rows[row].getElementsByTagName( "td" );
                        keyCell = rows[row].getElementsByClassName( "k" )[0];
                        valCell = rows[row].getElementsByClassName( "v" )[0];

                        if( keyCell && keyCell.firstChild && valCell ) {
                            key = keyCell.firstChild.nodeValue;
                            val = valCell.getElementsByClassName( "v" )[0];

                            if( mode === "remove" && remKey === key ) {
                                rows[row].parentNode.removeChild( rows[row] );
                            } else if( val ) {
                                val = val.firstChild.nodeValue
                                if( val ) {
                                    existingVals[key] = val;
                                }
                            }
                        }
                    }
                }

                if( mode !== "remove" ) {
                    tbl.parentNode.removeChild( tbl );
                }
            }

            if( mode !== "remove" ) {
                // no existing table; write it out
                var table = _createElement.call( this, "table", {
                    cellspacing: 0,
                    border: 0,
                    class: "req ent",
                    id: "watchTbl"
                }, this.panelNode );

                var thead = _createElement.call( this, "thead", {}, table );
                var tr = _createElement.call( this, "tr", {}, thead );
                _createElement.call( this, "th", {
                    class: "k"
                }, tr, "Key" );
                _createElement.call( this, "th", {
                    class: "v"
                }, tr, "Value" );
                _createElement.call( this, "th", {
                    class: "p"
                }, tr, "Prev" );

                var currWatches = _delimStringToObj( this.omRef.getPreference( "watchKeys" ) );
                for( key in currWatches ) {
                    if( currWatches.hasOwnProperty( key ) ) {
                        var kt = _getTitleForKey.call( this, key );

                        var row = _createElement.call( this, "tr", {}, table );
                        _createElement.call( this, "td", {
                            class: "k",
                            title: ( !! kt ? kt : "" )
                        }, row, key );
                        var cell = _createElement.call( this, "td", {
                            class: "v"
                        }, row );
                        _quoteValue.call( this, !! data.raw[key] ? data.raw[key] : null, cell );

                        var cell2 = _createElement.call( this, "td", {}, row );
                        _quoteValue.call( this, !! existingVals[key] ? existingVals[key] : null, cell2 );
                    }
                }
            }
        }

    } );
    Firebug.registerPanel( OmnibugSidePanel );


    /**
     * OmniUrl
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

}} );

