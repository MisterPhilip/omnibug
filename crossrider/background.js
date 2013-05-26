/************************************************************************************
  This is your background code.
  For more information please visit our wiki site:
  http://docs.crossrider.com/#!/guide/scopes_background
*************************************************************************************/
var tabs = {};
var reqs = 0;

appAPI.ready( function( $ ) {
    /*
     * Message listener, for requests from tabs
     */
    var lid = appAPI.message.addListener( function( msg ) {
    switch( msg.action ) {
        default:
            alert( "[bg] Received unknown message: a=" + msg.action + "; val=" + msg.value );
            break;
        }
    } );


    /*
     * Main request listener
     * @TODO: limit to regex matches on details.requestUrl
     * @TODO: add to a list for when caller is navigating
     */
    appAPI.webRequest.onRequest.addListener( function( details, opaqueData ) {
        appAPI.message.toAllTabs( { action: "webEvent", value: details } );
    } );
    
    
    /*
     * Browser button
     */
    appAPI.browserAction.setResourceIcon( 'o-64.png' );
    appAPI.browserAction.setTitle( 'Show Omnibug' );
    appAPI.browserAction.onClick(function() {
        // show the Omnibug window on the current tab
        appAPI.message.toActiveTab( { action: "activate" } );
    });

} );
