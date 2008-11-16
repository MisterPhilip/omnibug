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

    function OmnibugPanel() {}
    OmnibugPanel.prototype = extend( Firebug.Panel, {
        name: "Omnibug",
        title: "Omnibug",
        searchable: false,
        editable: false,
        cur: {},
        other: [],
        props: [],
        vars: [],
        htmlOutput: false,
        omRef: Firebug.Omnibug,

        /**
         * Initialize the panel. This is called when the Panel is activated and
         * whenever the browser document changes (new URL, reload).
         *
         * (this must override a method in Firebug)
         */
        initialize: function( context, doc ) {
            this.context = context;
            this.document = doc;
            this.panelNode = doc.createElement( "div" );
            this.panelNode.ownerPanel = this;
            this.panelNode.className = "panelNode panelNode-omnibug";
            doc.body.appendChild( this.panelNode );

            dump( ">>>   panel initialize: arguments=" + arguments + "\n" );
            if ( FirebugContext.omnibugContext ) {
                dump( ">>>   initialize: context already exists\n" );
                return;
            }

            // Create a context for this instance.
            FirebugContext.omnibugContext = new Omnibug.OmnibugContext( this );

            this.document.omnibugPanel = this;
            this.document.omnibugContext = FirebugContext.omnibugContext;
        },

        /*
         * Called whenever the panel comes into view. Like toggling between browser tabs.
         */
        show: function() {
            dump( ">>>   show: arguments=" + arguments + "\n" );

            this.latestOmnibugContext = FirebugContext.omnibugContext;  // save this to make detach work

            // There is only ONE DOCUMENT shared by all browser tabs. So if the user opens two
            // browser tabs, we have to restore the appropriate context when switching between tabs.
            this.document.omnibugContext = FirebugContext.omnibugContext;
        },

        printLine: function( msg ) {
            dump( ">>>   printLine: printing msg='" + msg + "'\n" );
            var el = this.document.createElement( "p" );
            el.className = "om";
            el.innerHTML = msg;
            this.panelNode.appendChild( el );
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

        appendHtml: function( data ) {
            //dump( ">>>   htmlOutput=" + OmnibugPanel.htmlOutput + "\n" );
            var str = "";
            //var elType = "<div>";

            // @TODO: figure out if html has already been output, and only send the link tag if not.
            str = "<head><link rel='stylesheet' type='text/css' href='chrome://omnibug/content/omnibug.css' /></head><body>\n";

            elType = "html";
            OmnibugPanel.htmlOutput = true;

            //dump( ">>> dumping html:\n\n>>>" + data + "\n\n" );

            var el = this.document.createElement( elType );
            el.innerHTML = str + data;
            this.panelNode.appendChild( el );
        },

        decodeUrl: function( data ) {
            dump( ">>>   decodeUrl: processing key=" + data.key + " (caller: " + getFuncName( FirebugContext.getPanel( "Omnibug" ).decodeUrl.caller ) + ")\n" );
            //dump( ">>>   decodeUrl: processing key=" + data.key + " (caller: " + getFuncName( arguments.callee.caller ) + ")\n" );

            OmnibugPanel.cur = data;
            OmnibugPanel.props = [];
            OmnibugPanel.other = [];
            OmnibugPanel.vars = [];

            var val,
                u = new OmniUrl( data.url ),
                _quote = this.quote;

            u.getQueryNames().forEach( function( n ) {
                if( n ) {
                    val = u.getFirstQueryValue( n ).replace( "<", "&lt;" );  // escape HTML in output HTML

                    // add surrounding quotes, if necessary
                    val = _quote( val );

                    if( n.match( /^c(\d+)$/ ) ) {
                        OmnibugPanel.props[RegExp.$1] = val;
                    } else if( n.match( /^v(\d+)$/ ) ) {
                        OmnibugPanel.vars[RegExp.$1] = val;
                    } else {
                        OmnibugPanel.other.push( [ n, val ] );
                    }
                }
            } );

            this.report();
        },

        /**
         * Return a quoted string (if the pref is set)
         */
        quote: function( str ) {
            return( Firebug.Omnibug.showQuotes
                        ? "<span class='qq'>\"</span>" + str + "<span class='qq'>\"</span>"
                        : str );
        },

        /**
         * Return a word that's camelCapped
         */
        camelCapser: function( str ) {
            return str.replace( /\b(.)/, function( m, $1 ) { return $1.toUpperCase() } );
        },

        report: function() {
            var i, el, cn, len, html, mf, expanderImage, expanderClass,
                eventType = ( OmnibugPanel.cur.doneLoading ? "click" : "load" ),
                urlLength = OmnibugPanel.cur.url.length,
                tmp = "",
                wt = "";

            // workaround -- kill it when vendor-specific code in place
            var url = OmnibugPanel.cur.url,
                      provider = ( url.match( /(?:\/b\/ss|2o7)/ ) ? "Omniture" :
                          ( url.match( /moniforce\.gif/ ) ? "Moniforce" :
                              ( url.match( /dcs\.gif/ ) ? "WebTrends" :
                                  ( url.match( /__utm\.gif/ ) ? "Urchin" :
                                      "Unknown"
                                  )
                              )
                          )
                      );


            if( this.omRef.alwaysExpand ) {
                expanderClass = "reg";
                expanderImage = "chrome://omnibug/skin/win/twistyOpen.png";
            } else {
                expanderClass = "hid";
                expanderImage = "chrome://omnibug/skin/win/twistyClosed.png";
            }

            html  = "<table cellspacing='0' border='0' class='req " + eventType + " " + OmnibugPanel.cur.src + "'><tr>";
            html += "<td class='exp'><a href='#' onClick='document.omnibugContext.toggle( this )'><img src='" + expanderImage + "' /></a></td>";
            html += "<td>";
            //html += "<p><strong>" + this.camelCapser( eventType ) + " event:</strong> " + OmnibugPanel.cur.key + " &rarr; " + OmnibugPanel.cur.url.substring( 0, 75 ) + "...</p><div class='" + expanderClass + "'>";
            html += "<p><strong>" + this.camelCapser( eventType ) + " event</strong>" + ( OmnibugPanel.cur.src === "prev" ? " (previous page)" : "" ) + " | "
                                  + provider + " | "
                                  + OmnibugPanel.cur.timeStamp + " | "
                                  + OmnibugPanel.cur.key + " | "
                                  + OmnibugPanel.cur.url.substring( 0, 75 ) + "...</p><div class='" + expanderClass + "'>";

            html += "<table class='ent'>";

            // Omnibug values
            html += "<th colspan='2'>Summary</th>";
            html += "<tr><td>Key</td><td>" + this.quote( OmnibugPanel.cur.key ) + "</td></tr>\n";
            html += "<tr><td>Event</td><td>" + this.quote( eventType ) + "</td></tr>\n";
            html += "<tr><td>Timestamp</td><td>" + this.quote( OmnibugPanel.cur.timeStamp ) + "</td></tr>\n";
            html += "<tr><td>Provider</td><td>" + this.quote( provider ) + "</td></tr>\n";
            html += "<tr><td>Source</td><td>" + this.quote( OmnibugPanel.cur.src === "prev" ? "Previous page" : "Current page" ) + "</td></tr>\n"; // might not be exactly working
            html += "<tr><td>Parent URL</td><td>" + this.quote( OmnibugPanel.cur.parentUrl ) + "</td></tr>\n";
            html += "<tr><td>Full URL</td><td>" + this.quote( OmnibugPanel.cur.url ) + "<br/>(" + urlLength + " characters";
            html += ( urlLength > 2083 ? ", <span class='imp'>*** too long for IE6/7! ***</span>" : "" ) + ")</td></tr>\n";

            // omniture props
            if( OmnibugPanel.props.length ) {
                //html += "<dt>Props</dt>";
                html += "<th colspan='2'>Props</th>";
                for( i = 0, len = OmnibugPanel.props.length; i < len; ++i ) {
                    if( OmnibugPanel.props[i] ) {
                        cn = this.isHighlightable( "prop" + i ) ? "hilite" : "";
                        html += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( i % 2 === 0 ? 'even' : 'odd' ) + "'>prop" + i + "</td><td class='v'>" + OmnibugPanel.props[i] + "</td></tr>\n";
                    }
                }
            }

            // omniture eVars
            if( OmnibugPanel.vars.length ) {
                //html += "<dt>eVars</dt>";
                html += "<th colspan='2'>eVars</th>";
                for( i = 0, len = OmnibugPanel.vars.length; i < len; ++i ) {
                    if( OmnibugPanel.vars[i] ) {
                        cn = this.isHighlightable( "eVar" + i ) ? "hilite" : "";
                        html += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( i % 2 === 0 ? 'even' : 'odd' ) + "'>eVar" + i + "</td><td class='v'>" + OmnibugPanel.vars[i] + "</td></tr>\n";
                    }
                }
            }


            // everything else
            var otherNamed = {},
                otherOther = {};

            if( OmnibugPanel.other.length ) {
                for( i = 0, len = OmnibugPanel.other.length; i < len; ++i ) {
                    if( OmnibugPanel.other[i] ) {
                        if( this.omRef.usefulKeys[OmnibugPanel.other[i][0]] ) {
                            otherNamed[OmnibugPanel.other[i][0]] = OmnibugPanel.other[i][1];
                        } else {
                            otherOther[OmnibugPanel.other[i][0]] = OmnibugPanel.other[i][1];
                        }
                    }
                }
            }

            i = 0;

            // useful omniture params
            for( el in otherNamed ) {
                if( otherNamed.hasOwnProperty( el ) ) {
                    cn = this.isHighlightable( el ) ? "hilite" : "";
                    tmp += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( ++i % 2 === 0 ? 'even' : 'odd' ) + "'>" + el + "</td><td class='v'>" + otherNamed[el] + "</td></tr>\n";
                }
            }
            if( !! tmp ) {
                html += "<th colspan='2'>Useful</th>";
                html += tmp;
            }

            i = 0;
            tmp = "";

            for( el in otherOther ) {
                if( otherOther.hasOwnProperty( el ) ) {
                    if( el === "[AQB]" || el === "[AQE]" ) { continue; } // skip Omniture's [AQB] and [AQE] elements

                    cn = this.isHighlightable( el ) ? "hilite" : "";
                    if( el.match( /^mfinfo/ ) ) {
                        mf += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( ++i % 2 === 0 ? "even" : "odd" ) + "'>" + el + "</td><td class='v'>" + otherOther[el] + "</td></tr>\n";
                    } else if( el.match( /^WT\./ ) ) {
                        wt += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( ++i % 2 === 0 ? "even" : "odd" ) + "'>" + el + "</td><td class='v'>" + otherOther[el] + "</td></tr>\n";
                    } else {
                        tmp += "<tr" + ( !! cn ? " class='" + cn + "'" : "" ) + "><td class='k " + ( ++i % 2 === 0 ? "even" : "odd" ) + "'>" + el + "</td><td class='v'>" + otherOther[el] + "</td></tr>\n";
                    }
                }
            }

            // moniforce
            if( !! mf ) {
                html += "<th colspan='2'>Moniforce</th>";
                html += mf;
            }

            // WebTrends
            if( !! wt ) {
                html += "<th colspan='2'>WebTrends</th>";
                html += wt;
            }

            // everything else, really
            if( !! tmp ) {
                html += "<th colspan='2'>Other</th>";
                html += tmp;
            }

            html += "</table></div></td></tr></table>\n";

            //dump( ">>>   output html:\n\n\n" + html + "\n\n\n" );
            FirebugContext.getPanel("Omnibug").appendHtml( html );
        },

        // returns true when the given name is in the highlightKeys list
        isHighlightable: function( elName ) {
            return this.omRef.highlightKeys[elName];
        },


        // Options menu

        // Called every time the options menu is opened
        getOptionsMenuItems: function() {
            return [
                this.optionMenu( "Enable File Logging", "enableFileLogging" ),
                this.optionMenu( "Always expand entries", "alwaysExpand" ),
                this.optionMenu( "Surround values with quotes", "showQuotes" )
            ];
        },

        // Return an option menu item
        optionMenu: function( label, option ) {
            var value = this.omRef.getPreference( option ),
                _omRef = this.omRef,
                updatePref = function( key, val ) {
                _omRef.setPreference( key, val );
            };
            // bindFixed is from Firebug. It helps to pass the args along.
            return { label: label, nol10n: true, type: "checkbox", checked: value, command: bindFixed( updatePref, Firebug, option, !value ) }
        }

    } );

    Firebug.registerPanel( OmnibugPanel );
}} );
