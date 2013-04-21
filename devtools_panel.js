/*
 * Chromnibug
 * DevTools panel code (view)
 */
window.Chromnibug = ( function() {
    var prefs;

    function show_message( msg ) {
        //alert( "[devtools_panel.js] do_something got called with msg=" + msg );
        //alert( "show_message called with msg=" + msg );

        var table = document.getElementById( "chr_table" );
        if( !! table ) {
            var td1 = document.createElement( "td" );
            td1.textContent = msg.omnibug["RequestId"];
            var td2 = document.createElement( "td" );
            td2.textContent = msg.omnibug["Full URL"];
            var tr = document.createElement( "tr" );
            tr.appendChild( td1 );
            tr.appendChild( td2 );
            var tbody = document.createElement( "tbody" );
            tbody.appendChild( tr );
            table.appendChild( tbody );
        } else {
            alert( "can't find table!" );
        }
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
        if( typeof( window.Chromnibug.send_message ) === "function" ) {
            try {
                window.Chromnibug.send_message( msg );
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

    /*
    // for click events (?)
    document.documentElement.onclick = function() {
        // No need to check for the existence of `respond`, because
        // the panel can only be clicked when it's visible...
        //respond('Another stupid example!');
    };
    */
}() );

