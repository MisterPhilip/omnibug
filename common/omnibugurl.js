/*
 * Omnibug
 * OmnibugUrl: class to parse a URL into component pieces
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */

var OmnibugUrl = function( url ) {
    this.url = url;
    this.parseUrl();
};

OmnibugUrl.prototype = (function() {
    var U = {
        hasQueryValue: function( key ) {
            return typeof this.query[key] !== 'undefined';
        },
        getFirstQueryValue: function( key ) {
            return this.query[key] ? this.query[key][0] : '';
        },
        getQueryValues: function( key ) {
            return this.query[key] ? this.query[key] : [];
        },
        getQueryNames: function() {
            var i, a = [];
            for( i in this.query ) {
                a.push( i );
            }
            return a;
        },
        getLocation: function() {
            return this.location;
        },
        getParamString: function() {
            return this.paramString;
        },
        addQueryValue: function( key ) {
            if( ! this.hasQueryValue( key ) ) {
                this.query[key] = [];
            }
            for( var i=1; i<arguments.length; ++i ) {
                this.query[key].push( arguments[i] );
            }
        },
        decode: function( val ) {
            var retVal = val;
            try {
                retVal = val ? decodeURIComponent( val.replace( /\+/g, "%20" ) ) : val === 0 ? val : '';
            } catch( e ) {
                try {
                    retVal = unescape( val.replace( /\+/g, "%20" ) );
                } catch( e ) {
                    // noop
                }
                //return val;
            }
            return retVal.replace( "<", "&lt;" ); 
        },

        smartSplit: function( str, sep, limit) {
            str = str.split( sep );
            if( str.length > limit ) {
                var ret = str.splice( 0, limit );
                ret.push( str.join( sep ) );
                return ret;
            }
            return str;
        },

        parseUrl: function() {
            var url = this.url;
            var sep = ( url.indexOf( "?" ) != -1 ? "?" : ";" );
            var pieces = this.smartSplit( url, sep, 1 );
            var p2 = pieces[0].split( ';' );
            this.query = {};
            this.queryString = '';
            this.anchor = '';
            this.location = p2[0];
            this.paramString = ( p2[1] ? p2[1] : '' );
            if( pieces[1] ) {
                var p3 = pieces[1].split( '#' );
                this.queryString = p3[0];
                this.anchor = ( p3[1] ? p3[1] : '' );
            }
            if( this.queryString ) {
                var kvSep = ( this.queryString.indexOf( "&" ) != -1 ? "&" : ";" );
                var kvPairs = this.queryString.split( kvSep );
                for( var i=0; i<kvPairs.length; ++i ) {
                    var kv = kvPairs[i].split( '=' );
                    this.addQueryValue( kv[0] ? this.decode( kv[0] ) : "", kv[1] ? this.decode( kv[1] ) : "" );
                }
            }
        }
    };
    return U;
} )();

