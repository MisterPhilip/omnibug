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

    /**
     * Return a map of key->display name of providers
     */
    getProviders: function() {
        var providers = {};
        for( var key in this ) {
            if( this.hasOwnProperty( key ) && typeof( this[key] ) !== "function" ) {
                providers[key] = this[key].name;
            }
        }
        return providers;

    },

    /**
     * Return a map of key->pattern
     */
    getPatterns: function() {
        var patterns = {};
        for( var key in this ) {
            if( this.hasOwnProperty( key ) && typeof( this[key] ) !== "function" ) {
                patterns[key] = this[key].pattern.source;
            }
        }
        return patterns;
    },

    /**
     * Return the provider for a URL, if any
     */
    getProviderForUrl: function( url ) {
        for( var key in this ) {
            if( this.hasOwnProperty( key ) && typeof( this[key] ) !== "function" && url.match( this[key].pattern ) ) {
                return this[key];
            }
        }
        return {
              key: "UNKNOWN"
            , name: "Unknown"
            , pattern: /^5831c14e26a2ded99d98782c15e92d62f195d9bcf53869f4d412cff5a074e5246c99916ada7ad760$/
            , keys: {
            },
            handleQueryParam: function( name, value, rv, raw ) {
                return false;
            }
        }
    },



    URCHIN: {
          key: "URCHIN"
        , name: "Google Analytics"
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
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys || name.match( /^utm.*/ ) ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    OMNITURE: {
          key: "OMNITURE"
        , name: "Adobe Analytics"
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
            , pccr:   "Prevent infinite redirects"
            , vid:    "Visitor ID"
            , vidn:   "New visitor ID"
            , fid:    "Fallback Visitor ID"
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
            , rsid:   "Report Suites"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            var _name;
            if( name.match( /^c(\d+)$/ ) || name.match( /^prop(\d+)$/i ) ) {
                // props
                _name = "Custom Traffic Variables"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["prop"+RegExp.$1] = value;
                raw["prop"+RegExp.$1] = value;
            } else if( name.match( /^v(\d+)$/ ) || name.match( /^evar(\d+)$/i ) ) {
                // eVars
                _name = "Conversion Variables"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["eVar"+RegExp.$1] = value;
                raw["eVar"+RegExp.$1] = value;
            } else if( name.match( /^\[?AQB\]?$/ ) || name.match( /^\[?AQE\]?$/ ) ) {
                // noop; skip Omniture's [AQB] and [AQE] elements
                raw[name] = value;
            } else if( name in this.keys ) {
                // anything else
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
            } else {
                return false;
            }
            return true;
        },
        handleCustom: function( url, rv, raw ) {
            if( url.match( /\/b\/ss\/([\w,]+)\// ) ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name]["rsid"] = RegExp.$1.split( "," );
                raw["rsid"] = RegExp.$1.split( "," );
            }
        }
    },

    MONIFORCE: {
          key: "MONIFORCE"
        , name: "Moniforce"
        , pattern: /moniforce\.gif/
        , keys: {
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys || name.match( /^mfinfo/ ) ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    WEBTRENDS: {
          key: "WEBTRENDS"
        , name: "WebTrends"
        , pattern: /dcs\.gif/
        , keys: {
              "WT.vt_tlv":   "Time of last visit (SDC)"
            , "WT.vt_f_tlv": "Time of last visit (cookie)"
            , "WT.vt_f_tlh": "Time of last hit"
            , "WT.vt_d":     "First visitor hit today (EA)"
            , "WT.vt_a_d":   "First visitor hit today (ARDS)"
            , "WT.vt_f_d":   "First visitor hit today (cookie)"
            , "WT.vt_s":     "First visitor hit this session"
            , "WT.vt_a_s":   "First visitor hit this account"
            , "WT.vt_f_s":   "First visitor hit this session (cookie)"
            , "WT.vt_f":     "First visitor hit (cookie)"
            , "WT.vt_f_a":   "First visitor hit this account (cookie)"
            , "WT.vt_sid":   "Session ID (deprecated)"
            , "WT.vtid":     "Session ID"
            , "WT.vtvs":     "Visitor session (timestamp)"
            , "WT.co":       "Client accepting cookies?"
            , "WT.co_d":     "Session stitching ID"
            , "WT.co_a":     "Multi account rollup ID"
            , "WT.co_f":     "Visitor session ID"
            , "WT.tu":       "Metrics URL truncated?"
            , "WT.hdr":      "Custom HTTP header tracking"
            , "WT.tv":       "Webtrends JS tag version"
            , "WT.site":     "Site ID"
            , "WT.tsrc":     "Custom traffic source"
            , "WT.dl":       "Event type" // http://help.webtrends.com/en/analytics9admin/event_tracking.html
            , "WT.nv":       "Parent element ID/class"
            , "WT.es":       "Event source"
            , "WT.dcs_id":   "DCS ID"
            , "WT.ti":       "Page title"
            , "WT.sp":       "Parent/child split"
            , "WT.srch":     "Search engine type"
            , "WT.tz":       "Time zone"
            , "WT.bh":       "Browsing hour"
            , "WT.ul":       "User language"
            , "WT.cd":       "Color depth"
            , "WT.sr":       "Screen resolution"
            , "WT.jo":       "Java enabled?"
            , "WT.js":       "Javascript enabled?"
            , "WT.jv":       "Javascript version"
            , "WT.ct":       "Connection type"
            , "WT.hp":       "Is home page?"
            , "WT.bs":       "Browser size"
            , "WT.fi":       "Flash installed?"
            , "WT.fv":       "Flash version"
            , "WT.le":       "Language encoding"
            , "WT.mle":      "Meta languate encoding"
            , "WT.em":       "Encoding method"
            , "WT.slv":      "Silverlight version"
            , "WT.ssl":      "SSL connection?"
            , "WT.dcsvid":   "Stored visitor"
            // more available here: http://www.webtrendstraining.net/content/data%20collection/documents/Webtrends%20Query%20Parameter%20Reference.pdf

            , "dcssip":      "Hostname"
            , "dcsuri":      "Source or destination URI"
            , "dcsqry":      "Query String"
            , "dcsdat":      "Timestamp"
            , "dcsaut":      "Authorized user?"
            , "dcsmet":      "Method"
            , "dcssta":      "HTTP Status code"
            , "dcsbyt":      "Bytes transferred"
            , "dcsref":      "Referrer URL"
            , "dcsredirect": "Cookie detection (internal)"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys || name.match( /^WT\./ ) || name.match( /^dcs/ ) ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    UNIVERSALANALYTICS : {
          key: "UNIVERSALANALYTICS"
        , name: "Universal Analytics"
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
            , "in":   "Item Name"
            , ip:     "Item Price"
            , iq:     "Item Quantity"
            , ic:     "Item Code"
            , iv:     "Item Category"
            , cu:     "Currency Code"
            , sn:     "Social Network"
            , sa:     "Social Action"
            , st:     "Social Action Target"
            , utl:    "User timing label"
            , plt:    "Page load time"
            , dns:    "DNS time"
            , pdt:    "Page download time"
            , rrt:    "Redirect response time"
            , tcp:    "TCP connect time"
            , srt:    "Server response time"
            , exd:    "Exception description"
            , exf:    "Is exception fatal?"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    COREMETRICS : {
          key: "COREMETRICS"
        , name: "Core Metrics"
        , pattern: /eluminate\/?\?.*tid=/
        , keys: {
            // http://www.akravitz.com/master-list-of-coremetrics-query-strings/
              at:   "Action tag ID" //  (at 5 = Shop Action 5, at 9 = Shop Action 9)
            , bp:   "Base price"
            , cat:  "Conversion action type" // (1=initiated event, 2=completed event)
            , cc:   "Currency code"
            , ccid: "Conversion event category ID"
            , cd:   "Registration code"
            , cg:    "Category"
            , ci:    "Client ID"
            , cid:   "Conversion event ID"
            , cjen:  "JSF parameter enabled"
            , cjsid: "JSF session ID"
            , cjuid: "JSF user ID"
            , cjvf:  "JSF valid"
            , cm_re: "Real estate tracking"
            , cm_sp: "Site promotions tracking"
            , cpt:   "Conversion points for conversion events"
            , ct:    "Billing city"
            , cy:    "Billing country"
            , ec:    "Character set encoding"
            , ecat:  "Element category"
            , eid:   "Element ID"
            , em:    "Email address"
            , fi:    "Form inputs"
            , hr:    "HREF"
            , je:    "Java enabled?"
            , jv:    "Javascript version"
            , lp:    "Landing page"
            , nm:    "Name of link"
            , on:    "Order number"
            , or11:  "Order attributes"
            , osk:   "Order SKU"
            , pc:    "Page view?"
            , pd:    "Color depth"
            , pflg:  "Product or page element?" // (product = 1, page = 0)
            , pi:    "Page ID"
            , pm:    "Product name"
            , pr:    "Product number"
            , qt:    "Quantity"
            , rf:    "Referring URL"
            , rnd:   "Random (cache-buster)"
            , sa:    "Billing state"
            , se:    "Search start page"
            , sg:    "Shipping"
            , sh:    "Screen height"
            , sr:    "Number of search results"
            , st:    "Session start time"
            , sw:    "Screen width"
            , sx11:  "Custom shop fields"
            , tid:   "Tag ID/type" // see values in URL above (@TODO: decode?)
            , tr:    "Total revenue"
            , tz:    "Time zone"
            , ul:    "Page URL"
            , vn1:   "Coremetrics library version"
            , vn2:   "Coremetrics library version 2"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            var _name;
            if( name.match( /^rg(\d+)$/ ) ) {
                _name = "Registration Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["rg"+RegExp.$1] = value;
            } else if( name.match( /^c_a(\d+)$/ ) ) {
                _name = "Conversion Event Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["c_a"+RegExp.$1] = value;
            } else if( name.match( /^cm_mmca(\d+)$/ ) ) {
                _name = "Marketing Tags"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["cm_mmca"+RegExp.$1] = value;
            } else if( name.match( /^cx(\d+)$/ ) ) {
                _name = "Conversion Events"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["cx"+RegExp.$1] = value;
            } else if( name.match( /^e_a(\d+)$/ ) ) {
                _name = "Element Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["e_a"+RegExp.$1] = value;
            } else if( name.match( /^np(\d+)$/ ) ) {
                _name = "Technical Browser Properties"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["np"+RegExp.$1] = unescape( value );
            } else if( name.match( /^o_a(\d+)$/ ) ) {
                _name = "Order Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["o_a"+RegExp.$1] = value;
            } else if( name.match( /^pr_a(\d+)$/ ) ) {
                _name = "Product View Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["pr_a"+RegExp.$1] = value;
            } else if( name.match( /^pv_a(\d+)$/ ) ) {
                _name = "Page View Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["pv_a"+RegExp.$1] = value;
            } else if( name.match( /^s_a(\d+)$/ ) ) {
                _name = "Shop Tag Attributes"
                rv[this.key] = rv[this.key] || {};
                rv[this.key][_name] = rv[this.key][_name] || {};
                rv[this.key][_name]["s_a"+RegExp.$1] = value;
            } else if( name in this.keys ) {
                // anything else
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
            } else {
                return false;
            }
            raw[name] = value;
            return true;
        }
    },

    ATINTERNET : {
          key: "ATINTERNET"
        , name: "AT Internet"
        , pattern: /\.xiti/
        , keys: {
              r:    "Screen resolution/depth"
            , p:    "Page name"
            , s:    "Site number"
            , s2:   "Site level 2"
            , lng:  "Language"
            , ref:  "Referrer"
            , re:   "Viewport resolution"
            , dest: "Destination URL"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    KISSMETRICS : {
          key: "KISSMETRICS"
        , name: "KISSmetrics"
        , pattern: /api\.mixpanel\.com\/track\//
        , keys: {
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name == "data" ) {
                var obj = atob( value );
                try {
                    var parsed = JSON.parse( obj );
                    for( var k in parsed ) {
                        if( parsed.hasOwnProperty( k ) ) {
                            if( typeof( parsed[k] ) === "object" ) {
                                for( var innerK in parsed[k] ) {
                                    if( parsed[k].hasOwnProperty( innerK ) ) {
                                        rv[this.key] = rv[this.key] || {};
                                        rv[this.key][k] = rv[this.key][k] || {};
                                        rv[this.key][k][innerK] = parsed[k][innerK];
                                        raw[innerK] = parsed[k][innerK];
                                    }
                                }
                            } else {
                                rv[this.key] = rv[this.key] || {};
                                rv[this.key][this.name] = rv[this.key][this.name] || {};
                                rv[this.key][this.name][k] = parsed[k];
                                raw[k] = parsed[k];
                            }
                        }
                    }
                } catch( e ) {
                    // noop
                }

                return true;
            } else if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    FBLIKE : {
          key: "FBLIKE"
        , name: "Facebook"
        , pattern: /facebook.*\/like\.php/
        , keys: {
              api_key:     "api_key"
            , locale:      "locale"
            , sdk:         "sdk"
            , channel_url: "channel_url"
            , href:        "href"
            , node_type:   "node_type"
            , width:       "width"
            , font:        "Font"
            , layout:      "Layout"
            , colorscheme: "Color scheme"
            , show_faces:  "Show faces?"
            , send:        "send"
            , extended_social_context: "Extended social context"
            , action:      "Action"
            , height:      "Height"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    TORBIT : {
          key: "TORBIT"
        , name: "Torbit Insight"
        , pattern: /insight-beacon\.torbit\.com/
        , keys: {
              onready: "onready"
            , onload:    "onload"
            , frontend: "frontend"
            , total_load_time: "Total load time"
            , red_t: "red_t"
            , cache_t: "Cache time"
            , dns_t: "DNS time"
            , tcp_t: "TCP time"
            , b_wait_t: "b_wait_t"
            , b_tran_t: "b_tran_t"
            , onready_t: "onready time"
            , onload_t: "onload time"
            , scr_proc_t: "scr_proc_t"
            , src: "src"
            , tbtim: "tbtim"
            , conversion: "conversion"
            , tags: "tags"
            , v: "v"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    QUANTSERVE : {
          key: "QUANTSERVE"
        , name: "Quantcast"
        , pattern: /pixel\.quantserve\.com\/pixel/
        , keys: {
              ref: "Referrer"
            , tzo: "Time zone offset"
            , dst: "Daylight savings time active?"
            , sr:  "Screen resolution"
            , et:  "Timestamp"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    MARKETO : {
          key: "MARKETO"
        , name: "Marketo"
        , pattern: /mktoresp.com\/webevents\/visitWebPage/
        , keys: {
              _mchNc: "Timestamp"
            , _mchCn: "_mchCn"
            , _mchId: "ID"
            , _mchTk: "_mchTk"
            , _mchHo: "Hostname"
            , _mchPo: "_mchPo"
            , _mchRu: "Request URL"
            , _mchPc: "Scheme"
            , _mchHa: "_mchHa"
            , _mchRe: "Referrer"
            , _mchQp: "_mchQp"
            , _mchVr: "_mchVr"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    CROWDFACTORY : {
          key: "CROWDFACTORY"
        , name: "Marketo Crowdfactory"
        , pattern: /\/tracker\/track\.gif/
        , keys: {
              cf_eventid:   "cf_eventid"
            , cachebust:    "Cache buster"
            , subscriber:   "Subscriber"
            , product:      "Product"
            , topcommunity: "topcommunity"
            , cflog_unk:    "cflog_unk"
            , html_escape:  "HTML escape?"
            , session:      "Session"
            , _mkto_trk:    "_mkto_trk"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    NEWRELIC : {
          key: "NEWRELIC"
        , name: "NewRelic"
        , pattern: /beacon.*\.newrelic\.com\//
        , keys: {
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name == "perf" ) {
                try {
                    var parsed = JSON.parse( value );
                    for( var k in parsed ) {
                        if( parsed.hasOwnProperty( k ) ) {
                            if( typeof( parsed[k] ) === "object" ) {
                                for( var innerK in parsed[k] ) {
                                    if( parsed[k].hasOwnProperty( innerK ) ) {
                                        rv[this.key] = rv[this.key] || {};
                                        rv[this.key][k] = rv[this.key][k] || {};
                                        rv[this.key][k][innerK] = parsed[k][innerK];
                                        raw[innerK] = parsed[k][innerK];
                                    }
                                }
                            } else {
                                rv[this.key] = rv[this.key] || {};
                                rv[this.key][this.name] = rv[this.key][this.name] || {};
                                rv[this.key][this.name][k] = parsed[k];
                                raw[k] = parsed[k];
                            }
                        }
                    }
                } catch( e ) {
                    // noop
                }

                return true;
            } else if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    KRUX : {
          key: "KRUX"
        , name: "Krux"
        , pattern: /beacon\.krxd\.net\/pixel\.gif/
        , keys: {
              geo_country: "Country"
            , geo_region:  "Region"
            , geo_city:    "City"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    OPTIMIZELY : {
          key: "OPTIMIZELY"
        , name: "Optimizely"
        , pattern: /optimizely\.com\/event/
        , keys: {
              t: "Timestamp"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    SOPHUS3 : {
          key: "SOPHUS3"
        , name: "sophus3"
        , pattern: /sophus3\.com\/i|sophus3\.com\/d/
        , keys: {
              r:      "Referrer URL"
            , tagv:   "Script Version"
            , Ts:     "Time Stamp"
            , sr:     "Screen Resolution"
            , sw:     "Screen Width"
            , ah:     "Actual Height"
            , aw:     "Actual Width"
            , sh:     "Screen Height"
            , pd:     "Pixel Depth"
            , cd:     "Colour Depth"
            , siteID: "SiteID"
            , ts:     "Ts"
            , "location": "Location"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    },

    DOUBLECLICK : {
          key: "DOUBLECLICK"
        , name: "Doubleclick"
        , pattern: /\.doubleclick\.net\/ad/
        , keys: {
              cat: "Category"
            , kwd: "Keywords"
            , sz:  "Size"
        },
        handleQueryParam: function( name, value, rv, raw ) {
            if( name in this.keys ) {
                rv[this.key] = rv[this.key] || {};
                rv[this.key][this.name] = rv[this.key][this.name] || {};
                rv[this.key][this.name][name] = value;
                raw[name] = value;
                return true;
            }
            return false;
        }
    }

};

