var obf = ( function() {
    var rotmap = [];
        rotchars = "abcdefghijklmnopqrstuvwxyz",
        b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function init() {
        var i, len;

        for( i=0, len=rotchars.length; i<len; i++ ) {
            rotmap[rotchars.charAt( i )] = rotchars.charAt( ( i+13 ) % 26 );
        }
        for( i=0; i<len; i++ ) {
            rotmap[rotchars.charAt( i ).toUpperCase()] = rotchars.charAt( ( i+13 ) % 26 ).toUpperCase();
        }

        window.onload = decode;
    }

    function decode() {
        var el, target, attr,
            els = document.getElementsByClassName( "e" );

        for( el in els ) {
            if( els.hasOwnProperty( el ) && els[el] instanceof Object ) {

                if( els[el].rel && els[el].rel.match( /e_/ ) ) {
                    target = els[el];
                    attr = "rel";
                } else if( els[el].value && els[el].value.match( /e_/ ) ) {
                    target = els[el];
                    attr = "value";
                }

                target[attr] = target[attr].replace( /^e_/, "" );
                target[attr] = rot13( b64dec( target[attr] ) );

                if( attr === "rel" ) {
                    target.href += target[attr];
                    target[attr] = "";
                }

            }
        }
    }


    function rot13( str ) {
        var b, i, len,
            s = "";

        for( i=0, len=str.length; i<len; i++ ) {
            b = str.charAt(i);
            s += ( b >= 'A' && b <= 'Z' || b >= 'a' && b <= 'z' ? rotmap[b] : b );
        }
        return s;
    }

    function b64dec( enc ) {
        var e1, e2, e3, e4, c1, c2, c3,
            dec = "",
            i = 0;

        // clean the input string
        enc = enc.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        do {
           e1 = b64chars.indexOf( enc.charAt( i++ ) );
           e2 = b64chars.indexOf( enc.charAt( i++ ) );
           e3 = b64chars.indexOf( enc.charAt( i++ ) );
           e4 = b64chars.indexOf( enc.charAt( i++ ) );

           c1 = ( e1 << 2 ) | ( e2 >> 4 );
           c2 = ( ( e2 & 15 ) << 4 ) | ( e3 >> 2 );
           c3 = ( ( e3 & 3 )  << 6 ) | e4;

           dec += String.fromCharCode( c1 );

           if( e3 !== 64 ) {
              dec += String.fromCharCode( c2 );
           }
           if( e4 !== 64 ) {
              dec += String.fromCharCode( c3 );
           }
        } while( i < enc.length );

        return dec;
    }

    init();

    return {
        rot13: rot13,
        b64dec: b64dec
    }
} )();
