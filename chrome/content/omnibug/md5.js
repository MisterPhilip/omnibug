/*
 * Native MD5 in Firefox; fetched and modified slightly on 17-July-2008 from:
 *     http://rcrowley.org/2007/11/15/md5-in-xulrunner-or-firefox-extensions/
 *
 * $Id$
 * $URL$
 */

Md5Impl = ( function() {
    var _md5 = null,
        Pub = {
        md5: function( str ) {
            if( null === _md5 ) {
                return "";
            }

            // Build array of character codes to MD5
            var arr = [];
            var ii = str.length;
            for( var i = 0; i < ii; ++i ) {
                arr.push( str.charCodeAt( i ) );
            }
            _md5.init( CI( 'nsICryptoHash' ).MD5 );
            _md5.update( arr, arr.length );
            var hash = _md5.finish( false );

            // Unpack the binary data bin2hex style
            var ascii = [];
            ii = hash.length;
            for( var i = 0; i < ii; ++i ) {
                var c = hash.charCodeAt( i );
                var ones = c % 16;
                var tens = c >> 4;
                ascii.push( String.fromCharCode( tens + ( tens > 9 ? 87 : 48 ) ) +
                    String.fromCharCode( ones + ( ones > 9 ? 87 : 48 ) ) );
            }

            return ascii.join( "" );
        }
    }

    // Components.interfaces helper
    if( typeof( "CI" ) !== "function" ) {
        function CI( ifaceName ) {
            return Components.interfaces[ifaceName];
        }
    }

    try {
        _md5 = CC( '@mozilla.org/security/hash;1' ).createInstance( CI( 'nsICryptoHash' ) );
    } catch( err ) {
        Components.utils.reportError( err );
    }

    return Pub;
} )();
