/*global describe it expect */

// provide a null implementation of _dump()
function _dump( msg ) {
}

describe( "augmentData", function() {
    "use strict";

    it( "correctly indicates a normal load event", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b",
            data = makeDataObject( url, false ),
            u = new OmnibugUrl( url );

        result = OmnibugCommon.augmentData( data, u );
        expect( result.omnibug.event ).toBe( OmnibugCommon.EVENT_TYPE_LOAD );
    } );

    it( "correctly indicates a normal click event", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b&pe=o_lnk",
            data = makeDataObject( url, true ),
            u = new OmnibugUrl( url );

        result = OmnibugCommon.augmentData( data, u );
        expect( result.omnibug.event ).toBe( OmnibugCommon.EVENT_TYPE_CLICK );
    } );

    it( "corrects for a load event marked as a click event", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b",
            data = makeDataObject( url, true ),
            u = new OmnibugUrl( url );

        result = OmnibugCommon.augmentData( data, u );
        expect( result.omnibug.event ).toBe( OmnibugCommon.EVENT_TYPE_LOAD );
    } );

    it( "corrects for a click event marked as a load event", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b&pe=o_lnk",
            data = makeDataObject( url, false ),
            u = new OmnibugUrl( url );

        result = OmnibugCommon.augmentData( data, u );
        expect( result.omnibug.event ).toBe( OmnibugCommon.EVENT_TYPE_CLICK );
    } );

    it( "returns appropriate values", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b",
            data = makeDataObject( url, false ),
            u = new OmnibugUrl( url );

        data.state.key = "ABC1234";
        data.state.timeStamp = 1376827437;
        data.state.src = "curr";
        data.state.parentUrl = "http://www.foo.bar/";

        result = OmnibugCommon.augmentData( data, u );

        expect( result.omnibug.key ).toBe( "ABC1234" );
        expect( result.raw.key ).toBe( "ABC1234" );

        expect( result.omnibug.timestamp ).toBe( 1376827437 );
        expect( result.raw.timestamp ).toBe( 1376827437 );

        expect( result.omnibug.provider ).toBe( OmnibugProvider.OMNITURE.name );
        expect( result.raw.provider ).toBe( OmnibugProvider.OMNITURE.name );

        expect( result.omnibug.source ).toBe( "Current page" );
        expect( result.raw.source ).toBe( "Current page" );

        expect( result.omnibug.parentUrl ).toBe( "http://www.foo.bar/" )
        expect( result.raw.parentUrl ).toBe( "http://www.foo.bar/" )

        expect( result.omnibug.fullUrl ).toBeDefined();
        expect( result.raw.fullUrl ).toBeDefined();
    } );

    it( "recognizes a previous page event", function() {
        var result,
            url = "http://www.foo.bar/beacon?a=b",
            data = makeDataObject( url, false ),
            u = new OmnibugUrl( url );

        data.state.src = "prev";

        result = OmnibugCommon.augmentData( data, u );

        expect( result.omnibug.source ).toBe( "Previous page" );
        expect( result.raw.source ).toBe( "Previous page" );
    } );



    /**
     * Helper
     */
    function makeDataObject( url, doneLoading ) {
        return {
            state: {
                url: url,
                doneLoading: doneLoading,
                omnibugProvider: OmnibugProvider.OMNITURE
            },
            raw: {}
        }
    }

} );
