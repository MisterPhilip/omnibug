/*
 * Omnibug
 * Provider data
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */



var OmnibugProvider = {
    /**
     * Gathers each provider's pattern and concatenates (with alternation)
     */
    getDefaultPattern: function() {
        var patterns = [];
        for( var key in this ) {
            if( this.hasOwnProperty( key ) && typeof( this[key] ) !== "function" ) {
                patterns.push( this[key].pattern.source );
            }
        }
        return new RegExp( patterns.join( "|" ) );
    },

    URCHIN: {
          name: "Urchin"
        , pattern: /__utm\.gif/
        , keys: {
              utmac:  "Account string"
            , utmcc:  "Cookie values"
            , utmcn:  "New campaign session?"
            , utmcr:  "Repeat campaign visit?"
            , utmcs:  "Browser language encoding"
            , utmdt:  "Page title"
            , utme:   "Extensible parameter"
            , utmfl:  "Flash version"
            , utmhn:  "Host name"
            , utmipc: "Product code/SKU"
            , utmipn: "Product name"
            , utmipr: "Unit price"
            , utmiqt: "Quantity"
            , utmiva: "Item variations"
            , utmje:  "Java-enabled browser?"
            , utmn:   "Unique ID"
            , utmp:   "Page request"
            , utmr:   "Referrer URL"
            , utmsc:  "Screen color depth"
            , utmsr:  "Screen resolution"
            , utmt:   "Request type"
            , utmtci: "Billing city"
            , utmtco: "Billing country"
            , utmtid: "Order ID"
            , utmtrg: "Billing region"
            , utmtsp: "Shipping cost"
            , utmtst: "Affiliation"
            , utmtto: "Order Total"
            , utmttx: "Tax"
            , utmul:  "Browser language"
            , utmwv:  "Tracking code version"
            , utmhid: "AdSense Hit ID"
            , utms:   "Requests made this session"
            , utmu:   "Client usage/Error data"
            , utmip:  "IP address"
            , utmvp:  "Viewport resolution"
            , utmni:  "Non-interaction event"
            , utmcsr: "Campaign source"
            , utmccn: "Campaign name"
            , utmcmd: "Campaign medium"
            , utmctr: "Campaign term/key phrase"
            , utmcct: "Campaign content"
            , utmsa:  "Social action"
            , utmsid: "Social destination"
            , utmsn:  "Social network name"
            , utmht:  "Time dispatched"
        }
    },

    OMNITURE: {
          name: "Omniture"
        , pattern: /\/b\/ss\/|2o7/
        , keys: {
              ns:     "Visitor namespace"
            , ndh:    "Image sent from JS?"
            , ch:     "Channel"
            , v0:     "Campaign"
            , r:      "Referrer URL"
            , ce:     "Character set"
            , cl:     "Cookie lifetime"
            , g:      "Current URL"
            , j:      "JavaScript version"
            , bw:     "Browser width"
            , bh:     "Browser height"
            , s:      "Screen resolution"
            , c:      "Screen color depth"
            , ct:     "Connection type"
            , p:      "Netscape plugins"
            , k:      "Cookies enabled?"
            , hp:     "Home page?"
            , pid:    "Page ID"
            , pidt:   "Page ID type"
            , oid:    "Object ID"
            , oidt:   "Object ID type"
            , ot:     "Object tag name"
            , pe:     "Link type"
            , pev1:   "Link URL"
            , pev2:   "Link name"
            , pev3:   "Video milestone"
            , c1:     "Prop1"
            , h1:     "Hierarchy var1"
            , h2:     "Hierarchy var2"
            , h3:     "Hierarchy var3"
            , h4:     "Hierarchy var4"
            , h5:     "Hierarchy var5"
            , v1:     "EVar1"
            , cc:     "Currency code"
            , t:      "Browser time"  // "[d/m/yyyy]   [hh:mm:ss]  [weekday]  [time zone offset]"
            , v:      "Javascript-enabled browser?"
            , v0:     "Campaign variable"
            , pccr:   "Prevent infinite redirects"
            , vid:    "Visitor ID"
            , vidn:   "New visitor ID"
            , cdp:    "Cookie domain periods"
            , pageName: "Page name"
            , pageType: "Page type"
            , server: "Server"
            , events: "Events"
            , products: "Products"
            , purchaseID: "Purchase ID"
            , state:  "Visitor state"
            , vmk:    "Visitor migration key"
            , vvp:    "Variable provider"
            , xact:   "Transaction ID"
            , zip:    "ZIP/Postal code"
        }
    },

    MONIFORCE: {
          name: "Moniforce"
        , pattern: /moniforce\.gif/
        , keys: {
        }
    },

    WEBTRENDS: {
          name: "WebTrends"
        , pattern: /dcs\.gif/
        , keys: {
        }
    },

    UNIVERSALANALYTICS : {
          name: "Universal Analytics"
        , pattern: /\/collect\/?\?/
        , keys: {
              v:      "Protocol Version"
            , tid:    "Tracking ID"
            , aip:    "Anonymize IP"
            , qt:     "Queue Time"
            , z:      "Cache Buster"
            , cid:    "Client ID"
            , sc:     "Session Control"
            , dr:     "Document Referrer"
            , cn:     "Campaign Name"
            , cs:     "Campaign Source"
            , cm:     "Campaign Medium"
            , ck:     "Campaign Keyword"
            , cc:     "Campaign Content"
            , ci:     "Campaign ID"
            , gclid:  "Google AdWords ID"
            , dclid:  "Google Display Ads ID"
            , sr:     "Screen Resolution"
            , vp:     "Viewport Size"
            , de:     "Document Encoding"
            , sd:     "Screen Colors"
            , ul:     "User Language"
            , je:     "Java Enabled"
            , fl:     "Flash Version"
            , t:      "Hit Type"
            , ni:     "Non-Interaction Hit"
            , dl:     "Document location URL"
            , dh:     "Document Host Name"
            , dp:     "Document Path"
            , dt:     "Document Title"
            , cd:     "Content Description"
            , an:     "Application Name"
            , av:     "Application Version"
            , ec:     "Event Category"
            , ea:     "Event Action"
            , el:     "Event Label"
            , ev:     "Event Value"
            , ti:     "Transaction ID"
            , ta:     "Transaction Affiliation"
            , tr:     "Transaction Revenue"
            , ts:     "Transaction Shipping"
            , tt:     "Transaction Tax"
            , "in":     "Item Name"
            , ip:     "Item Price"
            , iq:     "Item Quantity"
            , ic:     "Item Code"
            , iv:     "Item Category"
            , cu:     "Currency Code"
            , sn:     "Social Network"
            , sa:     "Social Action"
            , st:     "Social Action Target"
            , utc:    "User timing category"
            , utv:    "User timing variable name"
            , utt:    "User timing time"
            , utl:    "User timing label"
            , plt:    "Page Load Time"
            , dns:    "DNS Time"
            , pdt:    "Page Download Time"
            , rrt:    "Redirect Response Time"
            , tcp:    "TCP Connect Time"
            , srt:    "Server Response Time"
            , exd:    "Exception Description"
            , exf:    "Is Exception Fatal?"
            , a:      "?"
            , _v:     "?"
            , _u:     "?"
        }
    },

    COREMETRICS : {
          name: "Core Metrics"
        , pattern: /eluminate\/?\?.*tid=/
        , keys: {
        }
    },

    ATINTERNET : {
          name: "AT Internet"
        , pattern: /hit\.xiti/
        , keys: {
        }
    }
};

