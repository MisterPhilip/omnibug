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

    function _dump( str ) { var d = new Date(); dump( d.toLocaleTimeString() + "." + pad( d.getMilliseconds() ) + ":  " + str ); }


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

    // returns the title (if any) for a given key
    function _getTitleForKey( elName, provider ) {
        var title;
        try {
            title = provider.keys[elName];
        } catch( ex ) {
            // noop -- catch missing provider OR missing elName in keyTitles
        }
        return( !! title ? title : elName );
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
        var keys,
            obj = {};

        if( str != null && str != "" ) {
            keys = str.split( /, ?/ );

            for( var idx in keys ) {
                obj[keys[idx]] = 1;
            }
            return obj;
        }
        return {};
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
        //_dump( "removeFromWatches: key='" + key + "'; pref='" + pref + "'\n" );
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
        //_dump( "addToWatches: key='" + key + "'; pref='" + pref + "'\n" );
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
             * works better than the above.  still have to click clear more than once occasionally.. not sure why this is.
             * using this.panelNode.parentNode removes too much; subsequent requests without a page refresh won't get logged.
             */
            var el = this.panelNode;
                    for( var i=0; i<el.childNodes.length; ++i ) {
                el.removeChild( el.childNodes[i] );
            }
        },

        /**
         * Expands all rows currently closed
         *
         * @todo - refactor to not have to use click events (requires updates to OmnibugContext)
         */
        expandAll: function() {
            var el = this.panelNode,
                children = Array.prototype.slice.call(el.childNodes),
                clickEvent = new MouseEvent('click');
            for( var i= 0,l=children.length; i<l; ++i ) {
                var isExpanded = children[i].querySelector('td.summ > div.hid');
                if(isExpanded !== null) {
                    var link = children[i].querySelector('td.exp > a');
                    if(link !== null) {
                        children[i].querySelector('td.exp > a').dispatchEvent(clickEvent);
                    }
                }
            }
        },

        /**
         * Collapses all rows currently opened
         *
         * @todo - refactor to not have to use click events (requires updates to OmnibugContext)
         */
        collapseAll: function() {
            var el = this.panelNode,
                children = Array.prototype.slice.call(el.childNodes),
                clickEvent = new MouseEvent('click');
            for( var i= 0,l=children.length; i<l; ++i ) {
                var isExpanded = children[i].querySelector('td.summ > div.reg');
                if(isExpanded !== null) {
                    var link = children[i].querySelector('td.exp > a');
                    if(link !== null) {
                        children[i].querySelector('td.exp > a').dispatchEvent(clickEvent);
                    }
                }
            }
        },

        /**
         * Receives a data object from the model, decodes it, and passes it on to report()
         */
        decodeUrl: function( data ) {
            _dump( "decodeUrl: processing key=" + data.key + " (doneLoading=" + data.doneLoading + ")\n" );

            var val,
                u = new OmnibugUrl( data.url ),
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
                    that.processQueryParam( n, vals, provider, processedKeys, obj["raw"] );
                }
            } );

            this.delegateCustomProcessing( data.url, provider, processedKeys, obj["raw"] );

            // merge processedKeys into obj
            for( var key in processedKeys ) {
                if( processedKeys.hasOwnProperty( key ) ) {
                    obj[key] = processedKeys[key];
                }
            }

            try {
                obj = OmnibugCommon.augmentData( obj, u );
            } catch( ex ) {
                _dump( "decodeUrl: exception in augmentData(): " + ex + "\n" );
            }
            try {
                this.report( obj );
            } catch( ex ) {
                _dump( "decodeUrl: exception in report(): " + ex + "\n" );
            }
        },


        /**
         * Takes a single name/value pair and delegates handling of it to the provider
         * Otherwise, inserts into the `other' bucket
         */
        processQueryParam: function( name, value, provider, container, rawCont ) {
            if( provider.handleQueryParam( name, value, container, rawCont ) ) {
                // noop (container (and rawCont) modified by provider's method)
            } else {
                // stick in `other' (and rawCont)
                container["other"] = container["other"] || {};
                container["other"][name] = value;
                rawCont[name] = value;
            }
        },


        /**
         * If the provider defines a custom URL handler, delegate to it
         */
        delegateCustomProcessing: function( url, provider, container, rawCont ) {
            if( typeof( provider.handleCustom ) === "function" ) {
                provider.handleCustom( url, container, rawCont );
            }
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
            var provider = data.state.omnibugProvider;

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
                class: "req " + data.omnibug.event + ( data.state.src ? " " + data.state.src : "" ),
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

            _createElement.call( this, "strong", {}, p, this.camelCapser( data.omnibug.event ) + " event" );

            var str = ( data.state.src === "prev" ? " (previous page)" : "" ) + " | "
                    + data.omnibug.provider + " | "
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

            var summaryProvider = {
                keys: {
                    key:       "Key"
                  , "event":   "Event"
                  , timestamp: "Timestamp"
                  , provider:  "Provider"
                  , source:    "Source"
                  , parentUrl: "Parent URL"
                  , fullUrl:   "Full URL"
                }
            };
            this.generateReportSection( data.omnibug, summaryProvider, "Summary", tblCont );      // summary values

            for( var providerKey in data ) {
                if( data.hasOwnProperty( providerKey ) && providerKey in OmnibugProvider ) {
                    for( var sectionKey in data[providerKey] ) {
                        if( data[providerKey].hasOwnProperty( sectionKey ) ) {
                            this.generateReportSection( data[providerKey][sectionKey], provider, sectionKey, tblCont );  // provider-specific values
                        }
                    }
                }
            }
            this.generateReportSection( data.other, provider, "Other", tblCont );          // everything else

            var sp = this.getContext().getPanel("OmnibugSide");
            sp.updateWatches( data );

            _dump( "report: wrote entry for " + data.state.key + " (eventType=" + data.raw.event + ")\n" );
        },


        /**
         * Generate an HTML report fragment for the given section
         */
        generateReportSection: function( data, provider, title, parent ) {
            var i = 0,
                rows = [];

            for( var el in data ) {
                if( data.hasOwnProperty( el ) && !! data[el] ) {
                    rows.push( this.generateReportRow( el, data[el], provider, i++ ) );
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
         * Generate DOM elements for a single element
         */
        generateReportRow: function( key, value, provider, idx ) {
            var i = 0,
                cn = _isHighlightable.call( this, key ) ? "hilite" : "",
                keyTitle = _getTitleForKey.call( this, key, provider ),
                text = ( this.omRef.cfg.showFullNames ? keyTitle : key ),
                hover = ( this.omRef.cfg.showFullNames ? key : keyTitle ),
                value = this.processValue( value );

            var tr = _createElement.call( this, "tr", {
                class: cn,
                "data-key": key,
                title: ( !! hover ? hover : "" )
            } );
            var td = _createElement.call( this, "td", {
                class: "k " + ( i++ % 2 === 0 ? 'even' : 'odd' ),
                title: ( !! hover ? hover : "" )
            }, tr, text );

            var tdVal = _createElement.call( this, "td", { class: "v" }, tr );

            if( value instanceof Array && value.length > 1 ) {
                value.forEach( function( val ) {
                    tdVal.appendChild( val );
                } );
            } else {
                _quoteValue.call( this, value, tdVal );
            }

            return tr;
        },


        /**
         * Rewrite a value for more appropriate display
         */
        processValue: function( value ) {
            var stringValue = new String( value );
            if( stringValue.match( /^\d{13}(?:\.\d+)?$/ ) && stringValue.indexOf( 1 ) == 0 ) {
                return new Date( parseInt( value ) ) + "  [" + value + "]";
            } else if( stringValue.match( /^\d{10}$/ ) && stringValue.indexOf( 1 ) == 0 ) {
                return new Date( parseInt( value * 1000 ) ) + "  [" + value + "]";
            } else if( typeof( value ) === "object" && Object.keys( value ).length > 1 ) {
                var parts = [];
                for( var key in value ) {
                    if( value.hasOwnProperty( key ) ) {
                        var p = _createElement.call( this, "p", { class: "tblLi" } );
                        _quoteValue.call( this, value[key], p );
                        parts.push( p );
                    }
                }
                return parts;
            }
            return value;
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
                this.optionMenu( "Surround values with quotes", "showQuotes" ),
                this.optionMenu( "Show element descriptions instead of names", "showFullNames" )
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
            var val, tr, key,
                node = target,
                items = [];

            while( node && node.tagName.toUpperCase() !== "TR" ) {
                node = node.parentNode;
            }
            tr = node;
            key = tr.getAttribute( "data-key" );

            // get a handle to the tbody element, so we can use the className element later
            tbody = node;
            while( tbody && tbody.tagName && tbody.tagName.toUpperCase() !== "TBODY" ) {
                tbody = tbody.parentNode;
            }

            if( tr && key ) {
                if( key ) {
                    // watch
                    if( _isWatched.call( this, key ) ) {
                        items.push( "-", { label: "Unwatch '" + key + "'", command: bind( this.removePrefAndUpdateWatches, this, key, "watchKeys" ) } );
                    } else {
                        items.push( "-", { label: "Watch '" + key + "'", command: bind( this.addPref, this, key, "watchKeys" ) } );
                    }

                    // highlight
                    if( _isHighlightable.call( this, key ) ) {
                        items.push( "-", { label: "Unhighlight '" + key + "'", command: bind( this.removePref, this, key, "highlightKeys", tr ) } );
                    } else {
                        items.push( "-", { label: "Highlight '" + key + "'", command: bind( this.addPref, this, key, "highlightKeys", tr ) } );
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
            // _dump( ">>> updateWatches: data=" + data + "; mode=" + mode + "; rk=" + remKey + "\n" );
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
                            } else if( val && val.firstChild ) {
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

}} );

