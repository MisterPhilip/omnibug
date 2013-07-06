/*global describe it expect */
describe( "OmnibugURL", function() {
    "use strict";

    it( "returns the location", function() {
        var  url = "http://www.google.com/index.html?foo=bar",
            ourl = new OmnibugUrl( url );

        expect( ourl.getLocation() ).toBe( "http://www.google.com/index.html" );
    } );


    it( "escapes html in parameters", function() {
        var  url = "http://www.google.com/index.html?foo=<script>alert('bob')",
            ourl = new OmnibugUrl( url );

        expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "&lt;script>alert('bob')" );
    } );


    /**
     * Normal delimiters
     */
    describe( "parses ?-and-& delimited parameters", function() {
        it( "with a single key-value pair", function() {
            var  url = "http://www.google.com/index.html?foo=bar",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );
            expect( ourl.hasQueryValue( "abc" ) ).toBe( false );

            expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "bar" );
            expect( ourl.getFirstQueryValue( "abc" ) ).toBe( "" );

            expect( ourl.getQueryValues( "foo" ) ).toContain( "bar" );
            expect( ourl.getQueryValues( "foo" ).length ).toBe( 1 );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames().length ).toBe( 1 );
        } );


        it( "with multiple parameters", function() {
            var  url = "http://www.google.com/index.html?foo=bar&baz=quux&plugh=xyzzy",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );
            expect( ourl.hasQueryValue( "baz" ) ).toBe( true );
            expect( ourl.hasQueryValue( "plugh" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames() ).toContain( "baz" );
            expect( ourl.getQueryNames() ).toContain( "plugh" );
            expect( ourl.getQueryNames().length ).toBe( 3 );
        } );


        it( "with multiple values for the same parameter", function() {
            var  url = "http://www.google.com/index.html?foo=bar&foo=baz&foo=quux",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames().length ).toBe( 1 );

            expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "bar" );

            expect( ourl.getQueryValues( "foo" ) ).toContain( "bar" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "baz" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "quux" );
            expect( ourl.getQueryValues( "foo" ).length ).toBe( 3 );
        } );
    } );


    /**
     * Semicolon-delimiters
     */
    describe( "parses ?-and-; delimited parameters", function() {
        it( "with multiple parameters", function() {
            var  url = "http://www.google.com/index.html?foo=bar;baz=quux;plugh=xyzzy",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );
            expect( ourl.hasQueryValue( "baz" ) ).toBe( true );
            expect( ourl.hasQueryValue( "plugh" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames() ).toContain( "baz" );
            expect( ourl.getQueryNames() ).toContain( "plugh" );
            expect( ourl.getQueryNames().length ).toBe( 3 );
        } );


        it( "with multiple values for the same parameter", function() {
            var  url = "http://www.google.com/index.html?foo=bar;foo=baz;foo=quux",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames().length ).toBe( 1 );

            expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "bar" );

            expect( ourl.getQueryValues( "foo" ) ).toContain( "bar" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "baz" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "quux" );
            expect( ourl.getQueryValues( "foo" ).length ).toBe( 3 );
        } );
    } );


    /**
     * Path parameters
     */
    describe( "parses path parameters", function() {
        it( "with a single key-value pair", function() {
            var  url = "http://www.google.com/index.html;foo=bar",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );
            expect( ourl.hasQueryValue( "abc" ) ).toBe( false );

            expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "bar" );
            expect( ourl.getFirstQueryValue( "abc" ) ).toBe( "" );

            expect( ourl.getQueryValues( "foo" ) ).toContain( "bar" );
            expect( ourl.getQueryValues( "foo" ).length ).toBe( 1 );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames().length ).toBe( 1 );
        } );

        it( "with multiple parameters", function() {
            var  url = "http://www.google.com/index.html;foo=bar;baz=quux;plugh=xyzzy",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );
            expect( ourl.hasQueryValue( "baz" ) ).toBe( true );
            expect( ourl.hasQueryValue( "plugh" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames() ).toContain( "baz" );
            expect( ourl.getQueryNames() ).toContain( "plugh" );
            expect( ourl.getQueryNames().length ).toBe( 3 );
        } );

        it( "with multiple values for the same parameter", function() {
            var  url = "http://www.google.com/index.html;foo=bar;foo=baz;foo=quux?",
                ourl = new OmnibugUrl( url );

            expect( ourl.hasQueryValue( "foo" ) ).toBe( true );

            expect( ourl.getQueryNames() ).toContain( "foo" );
            expect( ourl.getQueryNames().length ).toBe( 1 );

            expect( ourl.getFirstQueryValue( "foo" ) ).toBe( "bar" );

            expect( ourl.getQueryValues( "foo" ) ).toContain( "bar" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "baz" );
            expect( ourl.getQueryValues( "foo" ) ).toContain( "quux" );
            expect( ourl.getQueryValues( "foo" ).length ).toBe( 3 );

        } );
    } );

} );
