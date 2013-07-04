/*global describe it expect */
describe( "Provider", function() {
    "use strict";

    describe( "Unknown", function() {
        it( "should return the unknown provider for an unknown URL", function() {
            var provider = OmnibugProvider.getProviderForUrl( "" );
            expect( provider.key ).toBe( "UNKNOWN" );
            expect( provider.handleQueryParam( null, null, null ) ).toBe( false );
        } );
    } );

    describe( "Urchin", function() {
        var url = "http://www.google-analytics.com/__utm.gif?utmwv=5.4.3&utms=2&utmn=902681115&utmhn=www.rosssimpson.com&utmcs=ISO-8859-1&utmsr=1280x800&utmvp=1116x378&utmsc=24-bit&utmul=en-us&utmje=1&utmfl=11.7%20r700&utmdt=Home%20of%20the%20Ross&utmhid=837672809&utmr=-&utmp=%2F&utmht=1372978201940&utmac=UA-168997-2&utmcc=__utma%3D167735229.2110921210.1372978198.1372978198.1372978198.1%3B%2B__utmz%3D167735229.1372978198.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmu=q~",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the GA provider for a GA URL", function() {
            expect( provider.key ).toBe( "URCHIN" );
            expect( provider.name ).toBe( "Google Analytics" );
        } );

        it( "should reject an unknown key", function() {
            var rv = {};
            expect( provider.handleQueryParam( "nonsenseValue", "", rv ) ).toBe( false );
        } );

        it( "should allow a known key", function() {
            var rv = {};
            expect( provider.handleQueryParam( "utmttx", 4, rv ) ).toBe( true );
            expect( rv[provider.key][provider.name].utmttx ).toBe( 4 );
        } );

        it( "should overwrite an existing value with a new one", function() {
            var rv = {};
            expect( provider.handleQueryParam( "utmttx", 4, rv ) ).toBe( true );
            expect( provider.handleQueryParam( "utmttx", 7, rv ) ).toBe( true );
            expect( rv[provider.key][provider.name].utmttx ).toBe( 7 );
        } );

    } );

} );
