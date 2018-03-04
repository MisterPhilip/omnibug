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
window.Omnibug = (() => {

    let d = document,
        settings = {},
        requestPanel = d.getElementById("requests"),
        noRequests = d.getElementById("no-requests");

    // Clear all requests
    d.querySelectorAll("a[href=\"#clear\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            // Clear our current requests
            while (requestPanel.firstChild) {
                requestPanel.removeChild(requestPanel.firstChild);
            }

            // Show the no requests found notification
            noRequests.classList.remove("d-none");
        })
    });

    // Open settings from links in devtools
    d.querySelectorAll("a[href=\"#settings\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            browser.runtime.openOptionsPage();
        })
    });

    // Open modals
    d.querySelectorAll("button[data-target-modal], a[data-target-modal]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = d.getElementById(element.getAttribute("data-target-modal"));
            if(target) {
                target.classList.add("active");
            }
        })
    });

    // Close modals
    d.querySelectorAll(".modal a[href=\"#close\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = element.closest(".modal");
            if(target) {
                target.classList.remove("active");
            }
        })
    });

    /**
     * Shortcut to creating an HTML element
     *
     * @param type          String
     * @param classList     []
     * @param attributes    []
     * @return {HTMLElement}
     */
    function createElement(type, classList = [], attributes = {}) {
        let element = d.createElement(type);
        if(classList.length) {
            element.classList.add(...classList);
        }
        Object.entries(attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
        return element;
    }

    function addRequest(request) {
        noRequests.classList.add("d-none");
        requestPanel.appendChild(buildRequest(request));
    }

    /**
     *
     *
     * @param request
     * @return {HTMLElement}
     */
    function buildRequest(request) {
        let details = createElement("details", ["request"]),
            summary = createElement("summary"),
            body = createElement("div");

        // Setup parent details element
        if(settings.alwaysExpand) {
            details.setAttribute("open", "open");
        }

        // Add the summary (title)
        let summaryContainer = createElement("div", ["container"]),
            summaryColumns = createElement("div", ["columns"]),
            colTitle = createElement("div", ["column", "col-3"]),
            colAccount = createElement("div", ["column", "col-3"]),
            colTime = createElement("div", ["column", "col-4"]);

        // Add the provider name & request type (if applicable)
        colTitle.innerText = request.provider.name;
        if(request.provider.columns.requestType) {
            let requestTypeEl = createElement("span", ["label"]),
                requestTypeValue = request.data.find((el) => {
                    return el.key === request.provider.columns.requestType;
                });

            // Verify the column / data exists, if so add it as a label
            if(requestTypeValue) {
                requestTypeEl.innerText = requestTypeValue.value;
                colTitle.appendChild(requestTypeEl);
            }
        }
        summaryColumns.appendChild(colTitle);

        // Add the account ID, if it exists
        if(request.provider.columns.account) {
            let accountValue = request.data.find((el) => {
                return el.key === request.provider.columns.account;
            });
            console.log(request.provider.columns.account, accountValue);
            if(accountValue) {
                colAccount.innerText = accountValue.value;
            }
        }
        summaryColumns.appendChild(colAccount);

        // Add the timestamp
        colTime.innerText = new Date(request.request.timestamp);
        summaryColumns.appendChild(colTime);

        // Append our summary
        summaryContainer.appendChild(summaryColumns);
        summary.appendChild(summaryContainer);
        details.appendChild(summary);

        let requestSummary = [];
        Object.entries(request.request).forEach((info) => {
            requestSummary.push({
                "key": "omnibug-" + info[0],
                "field": info[0],
                "value": info[1]
            });
        });

        let data = request.data.reduce((groups, item) => {
            if(!item.hidden) {
                const val = item.group;
                groups[val] = groups[val] || [];
                groups[val].push(item);
            }
            return groups;
        }, {"Summary": requestSummary});

        Object.entries(data).forEach((dataGroup) => {
            let panel = buildRequestPanel(dataGroup[0], dataGroup[1], settings.showFullNames);
            body.appendChild(panel);
        });
        details.appendChild(body);

        return details;
    }

    /**
     * Build the HTML for a request panel
     *
     * @param title string
     * @param data  []
     * @param useKey Boolean
     * @return {HTMLElement}
     */
    function buildRequestPanel(title, data = [], useKey = false) {
        let wrapper = createElement("details", ["request-details"], {"open": "open"});

        // Add the summary (title)
        let summary = createElement("summary");
        summary.innerText = title;
        wrapper.appendChild(summary);

        // Setup the table
        let table = createElement("table", ["table", "table-striped", "table-hover"]),
            tableBody = createElement("tbody");

        // Loop through each of the data objects to create a new table row
        data.sort((a, b) => {
            let aKey = a.field.toLowerCase(),
                bKey = b.field.toLowerCase();
            if(aKey < bKey) { return -1; }
            if(aKey > bKey) { return 1; }
            return 0;
        }).forEach((row) => {
            let tableRow = createElement("tr", [], {"data-parameter-key": row.key}),
                name = createElement("td"),
                value = createElement("td");
            name.innerText = useKey ? row.key : row.field;
            value.innerText = row.value;

            tableRow.appendChild(name);
            tableRow.appendChild(value);
            tableBody.appendChild(tableRow);
        });

        // Append the final results
        table.appendChild(tableBody);
        wrapper.appendChild(table);

        return wrapper;
    }

    // Old code below

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
            handle_clear_events_click();
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
                html += generateReportRow( el, data[el], provider, i++ );
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
             + "><td class='k " + ( idx % 2 === 0 ? 'even' : 'odd' ) + "'>"
             + text
             + "</td><td class='v'>"
             + quote( value )
             + "</td></tr>\n";

        return html;
    }

    function processValue( value ) {
        var stringValue = new String( value );
        if( stringValue.match( /^\d{13}(?:\.\d+)?$/ ) && stringValue.indexOf( 1 ) == 0 ) {
            return new Date( parseInt( value ) ) + "  [" + value + "]";
        } else if( stringValue.match( /^\d{10}$/ ) && stringValue.indexOf( 1 ) == 0 ) {
            return new Date( parseInt( value * 1000 ) ) + "  [" + value + "]";
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
        return( this.prefs.highlightKeys.indexOf( elName ) != -1 );
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

    /* borrowed from https://stackoverflow.com/questions/1219860/html-encoding-lost-when-attribute-read-from-input-field */
    function htmlEscape(str) {
        return typeof str !== 'string' ? str : str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Return a quoted string (if the pref is set)
     */
    function quote( str ) {
        if( this.prefs.showQuotes ) {
            return( ( typeof( str ) === "string" && str.indexOf( "<span class='qq'>" ) === 0 )
                ? str
                : "<span class='qq'>&quot;</span><span class='v'>" + htmlEscape( str ) + "</span><span class='qq'>&quot;</span>" )
        } else {
            return htmlEscape( str );
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
               + "table.load { background-color: #" + this.prefs.color_load + "; }\n"
               + "table.click { background-color: #" + this.prefs.color_click + "; }\n"
               + "table.prev { background-color: #" + this.prefs.color_prev + "; }\n"
               + "table.req .hilite { background-color: #" + this.prefs.color_hilite + "; }\n"
               + "table.req span.qq { color: #" + this.prefs.color_quotes + "; }\n"
               + "table.ent tr:hover { background-color: #" + this.prefs.color_hover + "; }\n"
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
                //alert( "exception sending: " + ex );
            }
        }
    }

    function handle_clear_events_click( ) {
        document.getElementById('clearResults').addEventListener('click', function () {
            var tables = document.getElementsByTagName("table");
            while (tables.length > 0)
            {
                for (var i = 0; i < tables.length; ++i)
                {
                    if (tables[i].className.match(/req/))
                    {
                        tables[i].parentNode.removeChild(tables[i]);
                    }
                }
                tables = document.getElementsByTagName("table");
            }
        });
    }

    // public
    return {
        /**
         * Receive a message from the port; delegate to appropriate handler
         */
        receive_message: function( message ) {
            if( message.event === "webRequest" ) {
                addRequest(message);
            } else if( message.event === "prefs" ) {
                handle_prefs_msg( message.payload );
            } else {
                parent_log( { "xUnknown message type received" : message } );
            }
        }
    };

})();