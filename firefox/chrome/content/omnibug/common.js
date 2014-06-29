/*
 * Omnibug
 * Firefox-common code
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */
var OmnibugCommon = {
	EVENT_TYPE_LOAD:  "load",
    EVENT_TYPE_CLICK: "click",

    /**
     * Debug logging method
     * @TODO: move out of here
     */
    _pad: function( n ) {
        return '' + ( n <= 9 ? "00" : n <= 99 ? "0" : '' ) + n;
    },
    _dump: function( str ) { if( typeof( dump ) !== "undefined" ) { var d = new Date(); dump( d.toLocaleTimeString() + "." + this._pad( d.getMilliseconds() ) + ":  " + str ); } },


    /**
     * Augments the data object with summary data
     * @param data the data object
     * @return the augmented data object
     */
    augmentData: function( data, omnibugUrl ) {
        data["omnibug"] = {};

        var eventType = ( data.state.doneLoading ? this.EVENT_TYPE_CLICK : this.EVENT_TYPE_LOAD ),
            url = data.state.url,
            urlLength = data.state.url.length,
            provider = data.state.omnibugProvider;

        // Sometimes load events are being reported as click events.  For Omniture, detect
        // the event type (pe= means a click event), and reset eventType accordingly.
        if( provider.key === "OMNITURE" ) {
            if( omnibugUrl.hasQueryValue( "pe" ) ) {
                this._dump( "augmentData: found Omniture `pe' parameter; overriding event type to `click' (was: " + eventType + ")\n" );
                eventType = this.EVENT_TYPE_CLICK;
            } else {
                this._dump( "augmentData: no Omniture `pe' parameter found; overriding event type to `load' (was: " + eventType + ")\n" );
                eventType = this.EVENT_TYPE_LOAD;
            }
        }

        data.omnibug["key"]       = data["raw"]["key"]       = data.state.key;
        data.omnibug["event"]     = data["raw"]["event"]     = eventType;
        data.omnibug["timestamp"] = data["raw"]["timestamp"] = data.state.timeStamp;
        data.omnibug["provider"]  = data["raw"]["provider"]  = data.state.omnibugProvider.name;
        data.omnibug["source"]    = data["raw"]["source"]    = ( data.state.src === "prev" ? "Previous page" : "Current page" );
        data.omnibug["parentUrl"] = data["raw"]["parentUrl"] = data.state.parentUrl;
        data.omnibug["fullUrl"]   = data["raw"]["fullUrl"]   = data.state.url
                                                             + " (" + urlLength + " characters"
                                                             + ( urlLength > 2083 ? ", *** too long for IE6/7! ***" : "" )
                                                             + ")";

        return data;
    }

};
