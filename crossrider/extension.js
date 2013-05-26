/************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/

var globalDoc;

function createPanel( document ) {
	var frameHeight = "12em";
	var iframe = document.createElement( "iframe" );
	iframe.src = "about:blank";
    iframe.style.width = "100%";
    iframe.style.backgroundColor = "#fff";
    iframe.style.border = 0;
	iframe.style.height = frameHeight;
	iframe.style.position = "fixed";
	iframe.style.bottom = "0";
	iframe.style.overflowY = "scroll";

    var bodyML = window.getComputedStyle( document.body ).getPropertyValue( "margin-left" );
    if( !! bodyML ) {
        bodyML = parseInt( bodyML, 10 );
        iframe.style.marginLeft = ( -1 * bodyML ) + "px";
    }
    
    document.body.style.marginBottom = frameHeight;
	document.body.appendChild( iframe );

	return iframe;
}

function addText( txt ) {
    var p = globalDoc.createElement( "p" );
    p.appendChild( globalDoc.createTextNode( txt ) );
    globalDoc.body.appendChild( p );
}

function styleFrame( ) {
	globalDoc.body.style.margin = 0;
	globalDoc.body.style.padding = "2px";
    globalDoc.body.style.backgroundColor = "#eee";
    globalDoc.body.style.borderTop = "2px solid #000";
}

function showWindow( $ ) {
    var iframe = createPanel( document );
    $( iframe.contentWindow ).load( function () {
        globalDoc = iframe.contentWindow.document;
        styleFrame();
        addText( "Omnibug[" + appAPI.getTabId() + "]" );
    } );
}

function handleWebEvent( details ) {
    if( details.pageUrl === document.location.href ) {
        addText( "reqUrl=" + details.requestUrl );
    }
}

appAPI.ready( function( $ ) {
	var lid = appAPI.message.addListener( function( msg ) {
		switch( msg.action ) {
			case 'alert':
				alert( msg.value );
                break;

            case "webEvent":
                handleWebEvent( msg.value );
                break;
                
            case "activate":
                showWindow( $ );
                break;
				
			default:
                alert( 'Received message with an unknown action\r\nType: ' + msg.type + '\r\nAction: ' + msg.action + '\r\nValue: ' + msg.value );
                break;
		}
	} );
	
} );
