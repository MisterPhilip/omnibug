/*global describe it expect */
describe( "Provider", function() {
    "use strict";

    describe( "Unknown", function() {
        it( "should return the unknown provider for an unknown URL", function() {
            var provider = OmnibugProvider.getProviderForUrl( "" );
            expect( provider.key ).toBe( "UNKNOWN" );
            expect( provider.handleQueryParam( null, null, null, null ) ).toBe( false );
        } );
    } );

    describe( "Urchin", function() {
        var url = "http://www.google-analytics.com/__utm.gif?utmwv=5.4.3&utms=2&utmn=902681115&utmhn=www.rosssimpson.com&utmcs=ISO-8859-1&utmsr=1280x800&utmvp=1116x378&utmsc=24-bit&utmul=en-us&utmje=1&utmfl=11.7%20r700&utmdt=Home%20of%20the%20Ross&utmhid=837672809&utmr=-&utmp=%2F&utmht=1372978201940&utmac=UA-168997-2&utmcc=__utma%3D167735229.2110921210.1372978198.1372978198.1372978198.1%3B%2B__utmz%3D167735229.1372978198.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B&utmu=q~",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the GA provider", function() {
            expect( provider.key ).toBe( "URCHIN" );
            expect( provider.name ).toBe( "Google Analytics" );
        } );

        it( "should reject an unknown key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "nonsenseValue", "", rv, raw ) ).toBe( false );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "utmttx", 4, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].utmttx ).toBe( 4 );
            expect( raw.utmttx ).toBe( 4 );
        } );

        it( "should overwrite an existing value with a new one", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "utmttx", 4, rv, raw ) ).toBe( true );
            expect( provider.handleQueryParam( "utmttx", 7, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].utmttx ).toBe( 7 );
            expect( raw.utmttx ).toBe( 7 );
        } );
    } );


    describe( "Omniture", function() {
        var url = "http://o.sa.aol.com/b/ss/aolsvc/1/H.25.4/s95323655775282?AQB=1&ndh=1&t=6%2F6%2F2013%2020%3A55%3A17%206%20-600&fid=3072B7AEA40CF981-2FE133AF4D25371B&ns=aolllc&cl=63072000&pageName=map%20%3A%20mq.main&g=http%3A%2F%2Fwww.mapquest.com%2F&cc=USD&ch=mq.mq&events=event10&c1=map%20%3A%20MQ10.com&c2=map%20%3A%20mq%20main&c3=gmt_5&c7=D%3DDNT&c10=external%20web%20browser&c12=http%3A%2F%2Fwww.mapquest.com%2F&c13=non-authenticated&c14=no%20referrer&v14=map%20%3A%20mapquest%7Cafarm%7Ctestbed%20A&c15=unavailable&c17=map%20%3A%20afarm%20%3A%20testbed%20A&c24=D%3Dv52&c49=H.25.4-May2013%7Cmmx_1&v52=uaid_1afb3152f63a49f2a86cb79169faa173&c55=108117104&c56=www.mapquest.com&c61=D%3Dpccr&s=1280x800&c=24&j=1.6&v=Y&k=Y&bw=1116&bh=378&p=Shockwave%20Flash%3BChrome%20Remote%20Desktop%20Viewer%3BNative%20Client%3BChrome%20PDF%20Viewer%3BLogitech%20Device%20Detection%3BAdobe%20Acrobat%20NPAPI%20Plug-in%2C%20Version%2010.1.7%3BCitrix%20Receiver%20Plug-in%3BShockwave%20for%20Director%3BGarmin%20Communicator%20Plug-in%20Version%204.0.1.0%3BGoogle%20Talk%20Plugin%3BJava%20Plug-In%202%20for%20NPAPI%20Browsers%3BGoogle%20Talk%20Plugin%20Video%20Accelerator%3BGoogle%20Talk%20Plugin%20Video%20Renderer%3BMicrosoft%20Office%20Live%20Plug-in%3BQuickTime%20Plug-in%207.7.1%3BSharePoint%20Browser%20Plug-in%3BSilverlight%20Plug-In%3B&AQE=1",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Omniture provider", function() {
            expect( provider.key ).toBe( "OMNITURE" );
            expect( provider.name ).toBe( "Omniture" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "ch", "mq.mq", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].ch ).toBe( "mq.mq" );
            expect( raw.ch ).toBe( "mq.mq" );
        } );

        it( "should populate an rsid in handleCustom", function() {
            var rv = {}, raw = {};
            provider.handleCustom( url, rv, raw );
            expect( rv[provider.key][provider.name].rsid ).toContain( "aolsvc" );
            expect( rv[provider.key][provider.name].rsid.length ).toBe( 1 );
            expect( raw.rsid ).toContain( "aolsvc" );
            expect( raw.rsid.length ).toBe( 1 );
        } );

        it( "should handle a custom traffic variable", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "c3", "gmt_5", rv, raw ) ).toBe( true );
            expect( rv[provider.key]["Custom Traffic Variables"].prop3 ).toBe( "gmt_5" );
            expect( raw.prop3 ).toBe( "gmt_5" );
        } );

        it( "should handle a conversion variable", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "evar1", "ooo", rv, raw ) ).toBe( true );
            expect( rv[provider.key]["Conversion Variables"].eVar1 ).toBe( "ooo" );
            expect( raw.eVar1 ).toBe( "ooo" );
        } );
    } );


    describe( "WebTrends", function() {
        var url = "http://ssdc.ups.com/dcslnrz6vne3g9s37bjvj8khc_2v8x/dcs.gif?x=1&dcsdat=1373109068915&dcssip=www.ups.com&dcsuri=/&WT.tz=10&WT.bh=21&WT.ul=en-US&WT.cd=24&WT.sr=1280x800&WT.jo=Yes&WT.ti=Shipping,%20Freight,%20Logistics%20and%20Supply%20Chain%20Management%20from%20UPS&WT.js=Yes&WBPM_ver=1.0.12&WBPM_ac=0&pgf_Site=Global%20Home&pCC=US&pLL=en&pSA=Global%20Entry%20Point&pSU=Global%20Entry&pPID=homepage/ent.html&pPS=0&pCS=Unknown&pSS=4400,C3&pJSV=0712&pCV=0712&pLI=1",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the WebTrends provider", function() {
            expect( provider.key ).toBe( "WEBTRENDS" );
            expect( provider.name ).toBe( "WebTrends" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "WT.co", 4, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name]["WT.co"] ).toBe( 4 );
            expect( raw["WT.co"] ).toBe( 4 );
        } );
    } );


    describe( "Univeral Analytics", function() {
        var url = "http://www.google-analytics.com/collect?v=1&_v=j10&a=1858140673&t=pageview&_s=1&dl=http%3A%2F%2Fomnibug.rosssimpson.com%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=1280x800&vp=1116x378&je=1&fl=11.7%20r700&_u=MAC~&cid=501006286.1373109213&tid=UA-41016297-1&z=1470222427",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the UA provider", function() {
            expect( provider.key ).toBe( "UNIVERSALANALYTICS" );
            expect( provider.name ).toBe( "Universal Analytics" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "v", 1, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].v ).toBe( 1 );
            expect( raw.v ).toBe( 1 );
        } );
    } );


    describe( "CoreMetrics", function() {
        var url = "https://sofa.bankofamerica.com/eluminate?tid=2&ci=90010394&vn2=e4.0&st=1373109441709&vn1=4.2.7.1BOA&ec=utf-8&pi=homepage%3AContent%3APersonal%3Bhome_personal&cd=20130706%3A0%3AO%3A1e0b4a25-a54c-47e4-88257bb330a6abe3&cg=homepage%3AContent%3APersonal&rg1=20130706%3A0%3AO%3A1e0b4a25-a54c-47e4-88257bb330a6abe3&rg11=0&li=101&ps1=20130706%3A0%3AO%3A1e0b4a25-a54c-47e4-88257bb330a6abe3&ps4=0&pc=N&rnd=1373113440226&ul=https%3A//www.bankofamerica.com/",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the CM provider", function() {
            expect( provider.key ).toBe( "COREMETRICS" );
            expect( provider.name ).toBe( "Core Metrics" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "tid", 2, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].tid ).toBe( 2 );
            expect( raw.tid ).toBe( 2 );
        } );

        // @TODO: custom tests for this provider!
    } );


    describe( "AT Internet", function() {
        var url = "http://logi242.xiti.com/hit.xiti?s=496741&s2=6&p=Home::Home&hl=21x18x42&ati=INT-87-[610x150],INT-51-HP,INT-72-,INT-60-HP,&x1=2&ptype=&lng=en-US&vtag=42003-31011&idp=2118429982821&jv=1&r=1280x800x24x24&re=1116x378&ref=&Rdt=On",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the AT provider", function() {
            expect( provider.key ).toBe( "ATINTERNET" );
            expect( provider.name ).toBe( "AT Internet" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "s2", 6, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].s2 ).toBe( 6 );
            expect( raw.s2 ).toBe( 6 );
        } );
    } );


    describe( "KISSmetrics", function() {
        var url = "https://api.mixpanel.com/track/?data=eyJldmVudCI6ICJtcF9wYWdlX3ZpZXciLCJwcm9wZXJ0aWVzIjogeyIkb3MiOiAiTWFjIE9TIFgiLCIkYnJvd3NlciI6ICJDaHJvbWUiLCIkaW5pdGlhbF9yZWZlcnJlciI6ICIiLCIkaW5pdGlhbF9yZWZlcnJpbmdfZG9tYWluIjogIiIsIm1wX2Jyb3dzZXIiOiAiQ2hyb21lIiwibXBfcGxhdGZvcm0iOiAiTWFjIE9TIFgiLCJtcF9wYWdlIjogImh0dHBzOi8vd3d3Lm9wdGltaXplbHkuY29tLyIsInRva2VuIjogIjFiNWUxODNhNTk2Yzg4NDA5NWM4NjVlM2QyNmRhZDEyIiwidGltZSI6IDEzNzMxMDk1OTh9fQ%3D%3D&ip=1&callback=mpq.metrics.jsonp_callback&_=1373109598523",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the KM provider", function() {
            expect( provider.key ).toBe( "KISSMETRICS" );
            expect( provider.name ).toBe( "KISSmetrics" );
        } );

        // @TODO: custom tests for this provider!
    } );


    describe( "Facebook Like", function() {
        var url = "http://www.facebook.com/plugins/like.php?api_key=&locale=en_US&sdk=joey&channel_url=http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D25%23cb%3Dfbbd2b444%26origin%3Dhttp%253A%252F%252Ftorbit.com%252Ff3ebcad89c%26domain%3Dtorbit.com%26relation%3Dparent.parent&href=http%3A%2F%2Ftorbit.com&node_type=link&width=200&font=verdana&layout=button_count&colorscheme=light&show_faces=false&send=false&extended_social_context=false",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the FB provider", function() {
            expect( provider.key ).toBe( "FBLIKE" );
            expect( provider.name ).toBe( "Facebook" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "api_key", "xxx", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].api_key ).toBe( "xxx" );
            expect( raw.api_key ).toBe( "xxx" );
        } );
    } );


    describe( "Torbit Insight", function() {
        var url = "https://insight-beacon.torbit.com/beacon.gif?onready=4181&frontend=3296&onload=5310&total_load_time=5310&red_t=0&cache_t=2&dns_t=30&tcp_t=450&b_wait_t=482&b_tran_t=144&onready_t=4154&onload_t=5307&scr_proc_t=1&src=nav&tbtim=&conversion=&tags=&v=0.3",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Torbit provider", function() {
            expect( provider.key ).toBe( "TORBIT" );
            expect( provider.name ).toBe( "Torbit Insight" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "v", "0.3", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].v ).toBe( "0.3" );
            expect( raw.v ).toBe( "0.3" );
        } );
    } );


    describe( "Quantserve", function() {
        var url = "http://pixel.quantserve.com/pixel;r=1906218773;a.1=p-94D6e1NDscLvI;labels.1=comment-links;a.2=p-18-mFEk4J448M;labels.2=type.intensedebate.embed;fpan=0;fpa=P0-1160896523-1373109920723;ns=0;ce=1;cm=;je=1;sr=1280x800x24;enc=n;dst=1;et=1373109964712;tzo=-600;ref=;url=http%3A%2F%2Ftorbit.com%2Fblog%2F;ogl=",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the QS provider", function() {
            expect( provider.key ).toBe( "QUANTSERVE" );
            expect( provider.name ).toBe( "Quantcast" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "tzo", "-600", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].tzo ).toBe( "-600" );
            expect( raw.tzo ).toBe( "-600" );
        } );
    } );


    describe( "Marketo", function() {
        var url = "https://361-ger-922.mktoresp.com/webevents/visitWebPage?_mchNc=1373109712539&_mchCn=&_mchId=361-GER-922&_mchTk=_mch-optimizely.com-1373109597780-65180&_mchHo=www.optimizely.com&_mchPo=&_mchRu=%2F&_mchPc=https%3A&_mchHa=&_mchRe=&_mchQp=&_mchVr=134",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Marketo provider", function() {
            expect( provider.key ).toBe( "MARKETO" );
            expect( provider.name ).toBe( "Marketo" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "_mchVr", "134", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name]._mchVr ).toBe( "134" );
            expect( raw._mchVr ).toBe( "134" );
        } );
    } );


    // @TODO: crowdfactory??

    
    describe( "NewRelic", function() {
        var url = "http://beacon-1.newrelic.com/1/1d1110a9fb?a=120775&be=523&qt=0&ap=258&dc=786&fe=3467&to=YlZaNkpUXxcDU01QV1sccjFoGmYhIB1wd34aWUsSF0dUBU1YVlRdG1lLEg%3D%3D&v=40&jsonp=NREUM.setToken&perf=%7B%22timing%22%3A%7B%22of%22%3A1373109832853%2C%20%22n%22%3A0%2C%20%22dl%22%3A457%2C%20%22di%22%3A1309%2C%20%22ds%22%3A1309%2C%20%22de%22%3A1362%2C%20%22dc%22%3A3947%2C%20%22l%22%3A3947%2C%20%22le%22%3A3990%2C%20%22f%22%3A0%2C%20%22dn%22%3A0%2C%20%22dne%22%3A0%2C%20%22c%22%3A0%2C%20%22ce%22%3A0%2C%20%22rq%22%3A2%2C%20%22rp%22%3A432%2C%20%22rpe%22%3A452%7D%2C%20%22navigation%22%3A%7B%22ty%22%3A1%7D%7D",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the NR provider", function() {
            expect( provider.key ).toBe( "NEWRELIC" );
            expect( provider.name ).toBe( "NewRelic" );
        } );

        // @TODO: custom tests for this provider!
    } );

    describe( "Krux", function() {
        var url = "http://beacon.krxd.net/pixel.gif?source=smarttag&fired=report&confid=Htl51cvA&geo_country=AU&geo_region=VIC&geo_city=MELBOURNE&_kpid=2ac9e72c-f5c4-414d-9087-6d7a4ef581a9&_kcp_s=RealEstate.com.au&_kcp_d=realestate.com.au&_knifr=8&_kpref_=http%3A//www.realestate.com.au/buy&_kua_kx_lang=en-us&_kua_kx_tech_browser_language=en-us&_kua_kx_geo_country=AU&_kua_kx_geo_region=VIC&_kua_kx_geo_city=MELBOURNE&t_navigation_type=0&t_dns=0&t_tcp=0&t_http_request=-1&t_http_response=51&t_content_ready=3060&t_window_load=7191&t_redirect=0&interchange_ran=false&dart_user=sect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*specialoffers%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*calculator%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*header%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*skyscraper%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*strip1%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*strip2%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*strip3%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*strip4%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*devfeaturetop%2Csect*resultslist%21state*VIC%21proptype*house%21region*eastern_melbourne%21pcode*3156%21sub*lysterfield%21price*750k_1m%21type*sales%21pos*footer&userdata_was_requested=false&userdata_did_respond=false&_kpa_dfpsite=rea.buy&_kpa_dfpzone=resultslist&sview=3&kplt0=18570&tag18570_timing=%5Bobject%20Object%5D&kplt1=22429&tag22429_timing=%5Bobject%20Object%5D&kplt2=16808&tag16808_timing=%5Bobject%20Object%5D",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Krux provider", function() {
            expect( provider.key ).toBe( "KRUX" );
            expect( provider.name ).toBe( "Krux" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "geo_country", "AU", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].geo_country ).toBe( "AU" );
            expect( raw.geo_country ).toBe( "AU" );
        } );
    } );


    describe( "Optimizely", function() {
        var url = "https://5935064.log.optimizely.com/event?a=5935064&d=5935064&y=false&x119719181=119639860&x138736319=138682902&x138750142=138753223&x203142438=203155272&x259890586=259997598&x5157657648300032=6645481564274688&s139230617=direct&s139230618=false&s140036362=gc&s159151144=none&n=https%3A%2F%2Fwww.optimizely.com%2F&u=oeu1373109597480r0.4041648709680885&t=1373109712591&f=26723025,30330250,119719181,132765658,136958754,138736319,138750142,147144536,147149313,172695640,187010911,188385901,203142438,221556644,229106841,230328893,235920352,238690970,249960640,250585311,253933470,256970873,259890586,262794055,5157657648300032",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Optimizely provider", function() {
            expect( provider.key ).toBe( "OPTIMIZELY" );
            expect( provider.name ).toBe( "Optimizely" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "t", "1374410630817", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].t ).toBe( "1374410630817" );
            expect( raw.t ).toBe( "1374410630817" );
        } );
    } );


    describe( "sophus3", function() {
        var url = "http://auto.sophus3.com/i?siteID=146&ts=1373110261038&alias=true&location=http%3A%2F%2Fwww.honda.co.uk%2Fcars%2Fhands%2Fview%2F%3Fs3pi1%3Dp%3AShockwave%20Flash%2Bf%3APepperFlashPlayer.plugin%2Bv%3Aundefined%3Bp%3AChrome%20Remote%20Desktop%20Viewer%2Bf%3Ainternal-remoting-viewer%2Bv%3Aundefined%3Bp%3ANative%20Client%2Bf%3AppGoogleNaClPluginChrome.plugin%2Bv%3Aundefined%3Bp%3AChrome%20PDF%20Viewer%2Bf%3APDF.plugin%2Bv%3Aundefined%3Bp%3ALogitech%20Device%20Detection%2Bf%3ALogitechDeviceDetection.plugin%2Bv%3Aundefined%3Bp%3AAdobe%20Acrobat%20NPAPI%20Plug-in%2C%20Version%2010.1.7%2Bf%3AAdobePDFViewerNPAPI.plugin%2Bv%3Aundefined%3B%26s3pi2%3Dp%3ACitrix%20Receiver%20Plug-in%2Bf%3ACitrixICAClientPlugIn.plugin%2Bv%3Aundefined%3Bp%3AShockwave%20for%20Director%2Bf%3ADirectorShockwave.plugin%2Bv%3Aundefined%3Bp%3AShockwave%20Flash%2Bf%3AFlash%20Player.plugin%2Bv%3Aundefined%3Bp%3AGarmin%20Communicator%20Plug-in%20Version%204.0.1.0%2Bf%3AGarminGpsControl.plugin%2Bv%3Aundefined%3Bp%3AGoogle%20Talk%20Plugin%2Bf%3Agoogletalkbrowserplugin.plugin%2Bv%3Aundefined%3B%26s3pi3%3Dp%3AJava%20Plug-In%202%20for%20NPAPI%20Browsers%2Bf%3AJavaAppletPlugin.plugin%2Bv%3Aundefined%3Bp%3AGoogle%20Talk%20Plugin%20Video%20Accelerator%2Bf%3Anpgtpo3dautoplugin.plugin%2Bv%3Aundefined%3Bp%3AGoogle%20Talk%20Plugin%20Video%20Renderer%2Bf%3Ao1dbrowserplugin.plugin%2Bv%3Aundefined%3Bp%3AMicrosoft%20Office%20Live%20Plug-in%2Bf%3AOfficeLiveBrowserPlugin.plugin%2Bv%3Aundefined%3Bp%3AQuickTime%20Plug-in%207.7.1%2Bf%3AQuickTime%20Plugin.plugin%2Bv%3Aundefined%3Bp%3ASharePoint%20Browser%20Plug-in%2Bf%3ASharePointBrowserPlugin.plugin%2Bv%3Aundefined%3B%26s3pi4%3Dp%3ASilverlight%20Plug-In%2Bf%3ASilverlight.plugin%2Bv%3Aundefined%3Bp%3A_-_&tagv=5.4.1b&tz=600&r=empty&aliased=http%3A%2F%2Fwww.honda.co.uk%2Fcars%2F&title=New%20Cars%20%7C%20Honda%20UK&cd=24&ah=778&aw=1222&sh=800&sw=1280&pd=24&huk_optin=4&s3log=1",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the sophus3 provider", function() {
            expect( provider.key ).toBe( "SOPHUS3" );
            expect( provider.name ).toBe( "sophus3" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "sh", 800, rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].sh ).toBe( 800 );
            expect( raw.sh ).toBe( 800 );
        } );
    } );


    describe( "Doubleclick", function() {
        var url = "http://ad.de.doubleclick.net/adj/worldsoffood.de/home;pack=diaet_abnehmen;theme=home;zustand=public;forum=nein;sz=468x60,728x90;ipv40=1;ipv50=1;ipv60=1;ipv70=0;ipv80=0;ipv90=0;ipv95=0;ipv100=0;ip_v=1;timeslot=265;tile=1;async=0;as13489=117847;as13489=117866;as13489=118019;as13489=118372;as13489=118422;as13489=118694;as13489=118748;asi=a11295;asi=a11296;asi=a11318;asi=a11319;asi=a10994;asi=a10045;asi=a10076;asi=a10088;asi=a10090;asi=a10095;asi=a10102;asi=b10001;asi=b0;j4=2;j5=3;i1=4;n1=4;n7=4;c1=0;c2=2;d7=2;j3=4;c3=1;d5=4;d6=4;d9=4;g2=4;d1=4;z2=7;ct_a=0;ct_b=1;ct_c=1;ct_i=1;ck_s=0;ct_y=0;ord=567683?",
            provider = OmnibugProvider.getProviderForUrl( url );

        it( "should return the Doubleclick provider", function() {
            expect( provider.key ).toBe( "DOUBLECLICK" );
            expect( provider.name ).toBe( "Doubleclick" );
        } );

        it( "should allow a known key", function() {
            var rv = {}, raw = {};
            expect( provider.handleQueryParam( "sz", "468x60", rv, raw ) ).toBe( true );
            expect( rv[provider.key][provider.name].sz ).toBe( "468x60" );
            expect( raw.sz ).toBe( "468x60" );
        } );
    } );

} );
