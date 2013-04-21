/*
 * Chromnibug
 * DevTools panel code (view)
 */
window.Chromnibug = ( function() {

    // public
    return {
	    show_message: function ( msg ) {
            //alert( "[devtools_panel.js] do_something got called with msg=" + msg );
            //alert( "show_message called with msg=" + msg );

            var table = document.getElementById( "chr_table" );
            if( !! table ) {
                var td1 = document.createElement( "td" );
                td1.textContent = msg.requestId;
                var td2 = document.createElement( "td" );
                td2.textContent = msg.url + " (" + localStorage["favorite_color"] + ")"
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

