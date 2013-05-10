/*
 * Omnibug
 * DevTools panel code (view)
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */
window.Omnibug = ( function() {
    var prefs;

    function show_message( msg ) {
        report( msg );
    }

    /**
     * Generate and output an event report in HTML format
     * @param data the data object to report on
     */
    function report( data ) {
        var i, el, cn, len, html, mf, expanderImage, expanderClass,
            provider = data.state.omnibugProvider,
            tmp = "",
            wt = "";

        if( this.prefs.alwaysExpand ) {
            expanderClass = "reg";
            expanderImage = "twistyOpen.png";
        } else {
            expanderClass = "hid";
            expanderImage = "twistyClosed.png";
        }

        html  = "<table cellspacing='0' border='0' class='req "
              + data.omnibug.Event + " "
              + ( data.state.src ? data.state.src : "" )
              + "' id='ob_" + data.state.requestId + "'><tr>";

        html += "<td class='exp'><a href='#' class='foo'><img src='images/" + expanderImage + "' /></a></td>";
        html += "<td class='summ'>";
        html += "<p class='summary'><strong>" + camelCapser( data.omnibug.Event ) + " event</strong>"
             + ( data.state.src === "prev" ? " (previous page)" : "" ) + " | "
             + provider.name + " | "
             + new Date( data.state.timeStamp ) + " | "
             + data.state.requestId
             + ( data.state.statusLine != null ? " | " + data.state.statusLine : "" )
             + "</p>";

        html += "<div class='" + expanderClass + "'><table class='ent'>";

        try {
            html += generateReportSection( data.omnibug, provider, "Summary" );  // summary values

            for( var providerKey in data ) {
                if( data.hasOwnProperty( providerKey ) && providerKey in OmnibugProvider ) {
                    for( var sectionKey in data[providerKey] ) {
                        if( data[providerKey].hasOwnProperty( sectionKey ) ) {
                            html += generateReportSection( data[providerKey][sectionKey], provider, sectionKey );  // provider-specific values
                        }
                    }
                }
            }

            html += generateReportSection( data.other,     provider, "Other" );  // everything else
        } catch( ex ) {
            parent_log( { "Error in gRS" : ex.message } );
        }

        html += "</table></div></td></tr></table>\n";
        appendHtml( html );
    }


    var dataSent = false;
    function appendHtml( data ) {
        var str = "";

        elType = "div";

        if( ! dataSent ) {
            str += getDynamicStyles();
        }
        dataSent = true;

        var el = document.createElement( elType );
        el.innerHTML = str + data;

        document.body.appendChild( el );

        var forEach = Array.prototype.forEach;
        forEach.call( document.links, function( link ) {
            link.addEventListener( "click", tableClickHandler, false );
        } );
    }

    /**
     * Handles clicks to the expand/collapse element
     */
    function tableClickHandler( e ) {
        e.preventDefault();
        e.stopPropagation();
        var tr = e.target.parentNode.parentNode.parentNode,
            td = tr.getElementsByTagName( "td" ),
            div = tr.getElementsByTagName( "div" )[0];

        // change expand/collapse icon
        for( i=0; i<td.length; ++i ) {
            if( td[i].className.match( /exp/ ) ) {
               img = td[i].getElementsByTagName( "img" )[0];
               if( img ) {
                   img.src = "images/twisty" + ( img.src.match( /Closed/ ) ? "Open" : "Closed" ) + ".png";
               }
            }
        }

        // hide/show the content div
        if( div.className.match( /hid/ ) ) {
            div.className = 'reg';
        } else {
            div.className = 'hid';
        }
    }


    /**
     * Generate an HTML report fragment for the given object
     */
    function generateReportSection( data, provider, title ) {
        var i = 0,
            html = "";

        for( var el in data ) {
            if( data.hasOwnProperty( el ) && !! data[el] ) {
                html += generateReportRow( el, data[el], provider, i );
            }
        }

        if( !! html ) {
            return   "<thead><tr><th colspan='2'>" + title + "</th><tr></thead>"
                   + "<tbody class='" + title.toLowerCase() + "'>" + html + "</tbody>"
        } else {
            return "";
        }
    }

    function generateReportRow( key, value, provider, idx ) {
        var cn = isHighlightable( key ) ? "hilite" : "",
            keyTitle = getTitleForKey( key, provider ),
            text = ( this.prefs.showFullNames ? keyTitle : key ),
            hover = ( this.prefs.showFullNames ? key : keyTitle ),
            value = processValue( value );

        html = "<tr"
             + ( !! hover ? " title='" + hover + "'" : "" )
             + ( !! cn ? " class='" + cn + "'" : "" )
             + "><td class='k " + ( idx++ % 2 === 0 ? 'even' : 'odd' ) + "'>"
             + text
             + "</td><td class='v'>"
             + quote( value )
             + "</td></tr>\n";

        return html;
    }

    function processValue( value ) {
        var stringValue = new String( value );
        if( stringValue.match( /^\d{13}(?:\.\d+)?$/ ) ) {
            return new Date( parseInt( value ) ) + "&nbsp;&nbsp;[" + value + "]";
        } else if( stringValue.match( /^\d{10}$/ ) && stringValue.indexOf( 1 ) == 0 ) {
            return new Date( parseInt( value * 1000 ) ) + "&nbsp;&nbsp;[" + value + "]";
        } else if( typeof( value ) === "object" && Object.keys( value ).length > 1 ) {
            var parts = [];
            for( var key in value ) {
                if( value.hasOwnProperty( key ) ) {
                    parts.push( quote( value[key] ) );
                }
            }
            return parts.join( ",<br>" );
        }
        return value;
    }


    // returns true when the given name is in the highlightKeys list
    function isHighlightable( elName ) {
        return this.prefs.highlightKeys[elName];
    }

    // returns the title (if any) for a given key
    function getTitleForKey( elName, provider ) {
        var title;
        try {
            title = provider.keys[elName];
        } catch( ex ) {
            // noop -- catch missing provider OR missing elName in keyTitles
        }
        return( !! title ? title : elName );
    }

    /**
     * Return a quoted string (if the pref is set)
     */
    function quote( str ) {
        if( this.prefs.showQuotes ) {
            return str.indexOf( "<span class='qq'>" ) === 0
                ? str
                : "<span class='qq'>\"</span><span class='v'>" + str + "</span><span class='qq'>\"</span>"
        } else {
            return str;
        }
    }

    /**
     * Return a word that's camelCapped
     */
    function camelCapser( str ) {
        return str.replace( /\b(.)/, function( m, $1 ) { return $1.toUpperCase() } );
    }

    /**
     * Returns a style block of dynamic styles
     * @return the style string
     * @TODO: move into style block in html page? or onshown method?
     */
    function getDynamicStyles() {
        // dynamic styles (e.g., from prefs)
        return "<style type='text/css'>\n"
               + "table.load { background-color: " + this.prefs.color_load + "; }\n"
               + "table.click { background-color: " + this.prefs.color_click + "; }\n"
               + "table.prev { background-color: " + this.prefs.color_prev + "; }\n"
               + "table.req .hilite { background-color: " + this.prefs.color_hilite + "; }\n"
               + "table.req span.qq { color: " + this.prefs.color_quotes + "; }\n"
               + "table.ent tr:hover { background-color: " + this.prefs.color_hover + "; }\n"
               + "</style>\n";
    }


    /**
     * Save the prefs object from the eventPage locally
     */
    function handle_prefs_msg( prefData ) {
        this.prefs = prefData;
    }

    /**
     * Send a log message back to the eventPage
     * send_message() is injected here by devtools.js
     */
    function parent_log( msg ) {
        if( typeof( window.Omnibug.send_message ) === "function" ) {
            try {
                window.Omnibug.send_message( msg );
            } catch( ex ) {
                alert( "exception sending: " + ex );
            }
        }
    }


    // public
    return {
        /**
         * Receive a message from the port; delegate to appropriate handler
         */
        receive_message: function( msg ) {
            //alert( "receive_message: type=" + msg.type );
            if( msg.type === "webEvent" ) {
                show_message( msg.payload );
            } else if( msg.type === "prefs" ) {
                handle_prefs_msg( msg.payload );
            } else {
                parent_log( { "Unknown message type received" : msg } );
            }
        }
    };

}() );

