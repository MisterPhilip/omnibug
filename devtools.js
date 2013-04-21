/*
 * Chromnibug
 * Intermediary between eventPage and devTools panel
 * used for message passing only
 */
( function() {

    /**
     * Callback for panelCreated event
     */
    var panelCreated = function( panel ) {
        var queuedMessages = [],
            panelWindow,  // reference to devtools_panel.html's `window` object
            port;

        port = chrome.extension.connect( { name: "chromnibug-" + chrome.devtools.inspectedWindow.tabId } );

        /**
         * Receieves messages from the eventPage
         */
        port.onMessage.addListener( function( msg ) {
            if( panelWindow ) {
                panelWindow.Chromnibug.show_message( msg );
            } else {
                queuedMessages.push( msg );
            }
        } );

        /**
         * Called when the devtools panel is first shown
         */
        panel.onShown.addListener( function tmp( _window ) {
            panel.onShown.removeListener( tmp ); // Run once only
            panelWindow = _window;

            // Release queued messages
            var msg;
            while( msg = queuedMessages.shift() )  {
                panelWindow.Chromnibug.show_message( msg );
            }

            // Pass a message back to the eventPage
            /*
                panelWindow.respond = function(msg) {
                    port.postMessage(msg);
                };
            */
        } );
    }

    /**
     * Create the panel
     */
    chrome.devtools.panels.create( "Chromnibug",
                                   "icon.png",
                                   "devtools_panel.html",
                                   panelCreated
                                 );

    // public
    return {};

}() );
