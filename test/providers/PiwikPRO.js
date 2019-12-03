import test from 'ava';

import { default as PiwikPROProvider } from "../source/providers/PiwikPRO.js";
import { OmnibugProvider } from "../source/providers.js";

test("PiwikPROProvider returns provider information", t => {
    let provider = new PiwikPROProvider();
    t.is(provider.key, "PIWIKPRO", "Key should always be PiwikPRO");
    t.is(provider.type, "Analytics", "Type should always be Analytics");
    t.is(provider.name, "Piwik PRO", "Name should be returned as Piwik PRO");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("PiwikPROProvider pattern should match PiwikPRO URLs", t => {
    let provider = new PiwikPROProvider(),
        urls = [
            "https://stats.omnibug.io/ppms.php?action_name=",
            "https://omnibug.piwik.cloud/ppms.php?action_name=",
            "https://omnibug.piwik.cloud/piwik/ppms.php?action_name=",
            "https://PiwikPRO.omnibug.io/ppms.php?action_name="
        ],
        ignoreUrls = [
            "https://omnibug.io/PiwikPRO",
            "https://PiwikPRO.omnibug.io/PiwikPRO.js"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), url);
    });

    ignoreUrls.forEach((url) => {
        t.false(provider.checkUrl(url), url);
    });
});

test("OmnibugProvider returns PiwikPROProvider", t => {
    let url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=037654&h=13&m=12&s=57&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=wYQaNh";

    let results = OmnibugProvider.parseUrl(url);
    t.is(results.provider.key, "PIWIKPRO", "Results provider should be PIWIKPRO");
});

test("PiwikPROProvider returns static data", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=037654&h=13&m=12&s=57&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=wYQaNh";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results should have provider information");
    t.is(results.provider.key, "PIWIKPRO", "Results provider is PIWIKPRO");
    t.is(typeof results.data, "object", "Results should have data");
    t.true(results.data.length > 0, "Data should be returned");
});

test("PiwikPROProvider returns host data", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=037654&h=13&m=12&s=57&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=wYQaNh";

    let results = provider.parseUrl(url),
        pageURL = results.data.find((result) => {
            return result.key === "url";
        });
    t.is(pageURL.field, "Page URL", "Page URL should be returned");
    t.is(pageURL.value, "http://localhost/PiwikPRO.html", "Page URL should be omnibug.io");
});

test("PiwikPROProvider returns custom data", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?idgoal=2&revenue=200&idsite=1&rec=1&r=056124&h=13&m=15&s=36&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=wYQaNh";

    let results = provider.parseUrl(url),
        trackingServer = results.data.find((result) => {
            return result.key === "trackingServer";
        }),
        goalType = results.data.find((result) => {
            return result.key === "revenue";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(trackingServer.field, "Tracking Server");
    t.is(trackingServer.value, "stats.omnibug.io");
    t.is(goalType.field, "Goal Revenue");
    t.is(goalType.value, "200");
    t.is(goalType.group, "general");

    t.is(requestType.value, "Goal");
});

test("PiwikPROProvider returns visit variables", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=427083&h=13&m=18&s=13&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&_cvar=%7B%221%22%3A%5B%22VisitorType%22%2C%22Member%22%5D%2C%222%22%3A%5B%22MemberType%22%2C%22Gold%20Star%22%5D%7D&gt_ms=1&pv_id=4KgENc";

    let results = provider.parseUrl(url),
        _cvar = results.data.find((result) => {
            return result.key === "_cvar";
        }),
        var1name = results.data.find((result) => {
            return result.key === "_cvar1n";
        }),
        var2value = results.data.find((result) => {
            return result.key === "_cvar2v";
        });
    t.is(_cvar.hidden, true);
    t.is(var1name.field, "Custom Visit Variable 1 Name");
    t.is(var1name.value, "VisitorType");
    t.is(var1name.group, "custom");
    t.is(var2value.field, "Custom Visit Variable 2 Value");
    t.is(var2value.value, "Gold Star");
    t.is(var2value.group, "custom");
});

test("PiwikPROProvider returns custom action variables", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=427083&h=13&m=18&s=13&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&cvar=%7B%221%22%3A%5B%22VisitorType%22%2C%22Member%22%5D%2C%222%22%3A%5B%22MemberType%22%2C%22Gold%20Star%22%5D%7D&gt_ms=1&pv_id=4KgENc";

    let results = provider.parseUrl(url),
        cvar = results.data.find((result) => {
            return result.key === "cvar";
        }),
        var1name = results.data.find((result) => {
            return result.key === "cvar1n";
        }),
        var2value = results.data.find((result) => {
            return result.key === "cvar2v";
        });
    t.is(cvar.hidden, true);
    t.is(var1name.field, "Custom Action Variable 1 Name");
    t.is(var1name.value, "VisitorType");
    t.is(var1name.group, "custom");
    t.is(var2value.field, "Custom Action Variable 2 Value");
    t.is(var2value.value, "Gold Star");
    t.is(var2value.group, "custom");
});

test("PiwikPROProvider returns custom dimensions", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?action_name=&idsite=1&rec=1&r=336484&h=13&m=21&s=8&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&dimension1=Member&dimension652=Gold%20Star&gt_ms=1&pv_id=OJeSct";

    let results = provider.parseUrl(url),
        dim652value = results.data.find((result) => {
            return result.key === "dimension652";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(dim652value.field, "Dimension 652");
    t.is(dim652value.value, "Gold Star");
    t.is(dim652value.group, "dimensions");

    t.is(requestType.value, "Page View");
});

test("PiwikPROProvider returns cart update data", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?idgoal=0&revenue=15.5&ec_items=%5B%5B%22123456%22%2C%22Test%20Book%22%2C%22Books%22%2C25.33%2C2%5D%5D&idsite=1&rec=1&r=653801&h=13&m=52&s=49&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=r84IET";

    let results = provider.parseUrl(url),
        prod1sku = results.data.find((result) => {
            return result.key === "ec_item1s";
        }),
        prod1name = results.data.find((result) => {
            return result.key === "ec_item1n";
        }),
        prod1cat = results.data.find((result) => {
            return result.key === "ec_item1c";
        }),
        prod1price = results.data.find((result) => {
            return result.key === "ec_item1p";
        }),
        prod1qty = results.data.find((result) => {
            return result.key === "ec_item1q";
        }),
        revenue = results.data.find((result) => {
            return result.key === "revenue";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(prod1sku.field, "Product 1 SKU");
    t.is(prod1sku.value, "123456");
    t.is(prod1sku.group, "ecommerce");

    t.is(prod1name.field, "Product 1 Name");
    t.is(prod1name.value, "Test Book");
    t.is(prod1name.group, "ecommerce");

    t.is(prod1cat.field, "Product 1 Category");
    t.is(prod1cat.value, "Books");
    t.is(prod1cat.group, "ecommerce");

    t.is(prod1price.field, "Product 1 Price");
    t.is(prod1price.value, "25.33");
    t.is(prod1price.group, "ecommerce");

    t.is(prod1qty.field, "Product 1 Quantity");
    t.is(prod1qty.value, "2");
    t.is(prod1qty.group, "ecommerce");

    t.is(revenue.field, "Cart Revenue");
    t.is(revenue.value, "15.5");
    t.is(revenue.group, "ecommerce");

    t.is(requestType.value, "Ecommerce");
});

test("PiwikPROProvider returns order data", t => {
    let provider = new PiwikPROProvider(),
        url = "https://stats.omnibug.io/ppms.php?idgoal=0&ec_id=A1133323&revenue=69.46&ec_st=74.46&ec_tx=5&ec_sh=15&ec_dt=10&ec_items=%5B%5B%22123456%22%2C%22Test%20Book%22%2C%5B%22Books%22%2C%22Best%20sellers%22%5D%2C25.33%2C2%5D%2C%5B%229780786706211%22%2C%22Endurance%3A%20Shackleton%27s%20Incredible%20Voyage%22%2C%5B%22Adventure%20Books%22%2C%22Best%20sellers%22%5D%2C8.8%2C1%5D%5D&idsite=1&rec=1&r=738851&h=13&m=30&s=11&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575144372&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=2f8yA2";

    let results = provider.parseUrl(url),
        prod2sku = results.data.find((result) => {
            return result.key === "ec_item2s";
        }),
        prod2name = results.data.find((result) => {
            return result.key === "ec_item2n";
        }),
        prod2cat = results.data.find((result) => {
            return result.key === "ec_item2c";
        }),
        prod2price = results.data.find((result) => {
            return result.key === "ec_item2p";
        }),
        prod2qty = results.data.find((result) => {
            return result.key === "ec_item2q";
        }),
        orderID = results.data.find((result) => {
            return result.key === "ec_id";
        }),
        discount = results.data.find((result) => {
            return result.key === "ec_dt";
        }),
        revenue = results.data.find((result) => {
            return result.key === "revenue";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(prod2sku.field, "Product 2 SKU");
    t.is(prod2sku.value, "9780786706211");
    t.is(prod2sku.group, "ecommerce");

    t.is(prod2name.field, "Product 2 Name");
    t.is(prod2name.value, "Endurance: Shackleton's Incredible Voyage");
    t.is(prod2name.group, "ecommerce");

    t.is(prod2cat.field, "Product 2 Category");
    t.is(prod2cat.value, "Adventure Books, Best sellers");
    t.is(prod2cat.group, "ecommerce");

    t.is(prod2price.field, "Product 2 Price");
    t.is(prod2price.value, "8.8");
    t.is(prod2price.group, "ecommerce");

    t.is(prod2qty.field, "Product 2 Quantity");
    t.is(prod2qty.value, "1");
    t.is(prod2qty.group, "ecommerce");

    t.is(orderID.field, "Order ID");
    t.is(orderID.value, "A1133323");
    t.is(orderID.group, "ecommerce");

    t.is(discount.field, "Discount");
    t.is(discount.value, "10");
    t.is(discount.group, "ecommerce");

    t.is(revenue.field, "Order Revenue");
    t.is(revenue.value, "69.46");
    t.is(revenue.group, "ecommerce");

    t.is(requestType.value, "Ecommerce");
});

test("PiwikPROProvider handles request types", t => {
    let provider = new PiwikPROProvider(),
        exitUrl = "https://stats.omnibug.io/ppms.php?exit=http%3A%2F%2Fmydomain.co.uk%2F&idsite=1&rec=1&r=966547&h=13&m=35&s=19&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9",
        downloadUrl = "https://stats.omnibug.io/ppms.php?download=http%3A%2F%2Fmydomain.co.uk%2Fmailto%2FAgent%20namexyz&idsite=1&rec=1&r=636736&h=13&m=35&s=11&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9",
        searchUrl = "https://stats.omnibug.io/ppms.php?search=Banana&search_cat=Organic%20Food&search_count=35&idsite=1&rec=1&r=387935&h=13&m=36&s=21&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9",
        contentUrl = "https://stats.omnibug.io/ppms.php?c_i=tabActivated&c_n=Content%20Name&c_p=Content%20Piece&c_t=http%3A%2F%2Fwww.example.com&idsite=1&rec=1&r=336165&h=13&m=36&s=52&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9",
        pingUrl = "https://stats.omnibug.io/ppms.php?ping=1&idsite=1&rec=1&r=336165&h=13&m=36&s=52&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9",
        customEvent = "https://stats.omnibug.io/ppms.php?e_c=event%20category&e_a=event%20action&e_n=event%20name&idsite=1&rec=1&r=336165&h=13&m=36&s=52&url=http%3A%2F%2Flocalhost%2FPiwikPRO.html&_id=6a45e22e58f0786b&_idts=1575143580&_idvc=1&_idn=0&_refts=0&_viewts=1575143580&_ects=1575145811&cs=windows-1252&send_image=1&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=2560x1440&gt_ms=1&pv_id=tDfpI9";


    let exitResults = provider.parseUrl(exitUrl),
        downloadResults = provider.parseUrl(downloadUrl),
        searchResults = provider.parseUrl(searchUrl),
        contentResults = provider.parseUrl(contentUrl),
        pingResults = provider.parseUrl(pingUrl),
        eventResults = provider.parseUrl(customEvent),

        exitType = exitResults.data.find((result) => {
            return result.key === "requestType";
        }),
        downloadType = downloadResults.data.find((result) => {
            return result.key === "requestType";
        }),
        searchType = searchResults.data.find((result) => {
            return result.key === "requestType";
        }),
        contentType = contentResults.data.find((result) => {
            return result.key === "requestType";
        }),
        pingType = pingResults.data.find((result) => {
            return result.key === "requestType";
        }),
        eventType = eventResults.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(exitType.value, "Exit Click");
    t.is(downloadType.value, "Download Click");
    t.is(searchType.value, "Site Search");
    t.is(contentType.value, "Content Interaction");
    t.is(pingType.value, "Ping");
    t.is(eventType.value, "Custom Event");
});