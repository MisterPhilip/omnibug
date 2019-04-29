import test from 'ava';

import { default as GoogleAdsProvider } from "./../source/providers/GoogleAds.js";
import { OmnibugProvider } from "./../source/providers.js";

test("GoogleAdsProvider returns provider information", (t) => {
    let provider = new GoogleAdsProvider();
    t.is(provider.key, "GOOGLEADS", "Key should always be GOOGLEADS");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("GoogleAdsProvider pattern should match AW calls", t => {
    let provider = new GoogleAdsProvider(),
        urls = [
            "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=846177263&cv=9&fst=*&num=1&label=AbC-D_efG-h12_34-567&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dpurchase%3Ballow_custom_scripts%3Dtrue&frm=0&url=https://omnibug.io/&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&fmt=3&ctc_id=CAIVAgAAAB0CAAAA&ct_cookie_present=false&ocp_id=BLrEXM3MC6KonAf3x6yQCw&crd=&gtd=",
            "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dgtag.config&frm=0&url=https%3A%2F%2Fomnibug.io%2F&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&rfmt=3&fmt=4"
        ],
        badUrls = [
            "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Google Ads", t => {
    let url = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dgtag.config&frm=0&url=https%3A%2F%2Fomnibug.io%2F&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&rfmt=3&fmt=4",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "GOOGLEADS", "Results provider is Google Ads");
});

test("GoogleAdsProvider returns data", t => {
    let provider = new GoogleAdsProvider(),
        url = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dgtag.config&frm=0&url=https%3A%2F%2Fomnibug.io%2F&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&rfmt=3&fmt=4",
        results = provider.parseUrl(url),
        pageUrl = results.data.find((result) => {
            return result.key === "url";
        }),
        tiba = results.data.find((result) => {
            return result.key === "tiba";
        });

    t.is(typeof pageUrl, "object");
    t.is(pageUrl.value, "https://omnibug.io/");

    t.is(typeof tiba, "object");
    t.is(tiba.field, "Page Title");
    t.is(tiba.value, "Omnibug | A Digital Marketing Debugging Tool");
});

test("GoogleAdsProvider returns account", t => {
    let provider = new GoogleAdsProvider(),
        url = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dgtag.config&frm=0&url=https%3A%2F%2Fomnibug.io%2F&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&rfmt=3&fmt=4",
        results = provider.parseUrl(url),
        account = results.data.find((result) => {
            return result.key === "account";
        }),
        accountHidden = results.data.find((result) => {
            return result.key === "omnibug-account";
        });

    t.is(typeof account, "object");
    t.is(account.field, "Account ID");
    t.is(account.value, "AW-1111111");

    t.is(typeof accountHidden, "object");
    t.is(accountHidden.value, "AW-1111111");
});

test("GoogleAdsProvider returns account with conversion label", t => {
    let provider = new GoogleAdsProvider(),
        url = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=846177263&cv=9&fst=*&num=1&label=AbC-D_efG-h12_34-567&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dpurchase%3Ballow_custom_scripts%3Dtrue&frm=0&url=https://omnibug.io/&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&fmt=3&ctc_id=CAIVAgAAAB0CAAAA&ct_cookie_present=false&ocp_id=BLrEXM3MC6KonAf3x6yQCw&crd=&gtd=",
        results = provider.parseUrl(url),
        account = results.data.find((result) => {
            return result.key === "account";
        }),
        accountHidden = results.data.find((result) => {
            return result.key === "omnibug-account";
        });

    t.is(typeof account, "object");
    t.is(account.field, "Account ID");
    t.is(account.value, "AW-1111111");

    t.is(typeof accountHidden, "object");
    t.is(accountHidden.value, "AW-1111111/AbC-D_efG-h12_34-567");
});

test("GoogleAdsProvider returns request type", t => {
    let provider = new GoogleAdsProvider(),
        pageViewUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dgtag.config&frm=0&url=https%3A%2F%2Fomnibug.io%2F&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&rfmt=3&fmt=4",
        purchaseUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=846177263&cv=9&fst=*&num=1&label=AbC-D_efG-h12_34-567&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dpurchase%3Ballow_custom_scripts%3Dtrue&frm=0&url=https://omnibug.io/&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&fmt=3&ctc_id=CAIVAgAAAB0CAAAA&ct_cookie_present=false&ocp_id=BLrEXM3MC6KonAf3x6yQCw&crd=&gtd=",
        loginUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=3539464&cv=9&fst=*&num=1&label=AbC-D_efG-h12_34-567&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dlogin&frm=0&url=https://omnibug.io/&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&fmt=3&ctc_id=CAIVAgAAAB0CAAAA&ct_cookie_present=false&ocp_id=E8HEXPXuJ4uu7wL3p42wBg&crd=&gtd=",
        conversionUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1",
        miscUrl = "https://googleads.g.doubleclick.net/pagead/viewthroughexample/1111111/?random=1556397983526&cv=9&fst=1556397983526&num=1&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1",

        pageViewResults = provider.parseUrl(pageViewUrl),
        purchaseResults = provider.parseUrl(purchaseUrl),
        loginResults = provider.parseUrl(loginUrl),
        conversionResults = provider.parseUrl(conversionUrl),
        miscResults = provider.parseUrl(miscUrl),
        pageViewType = pageViewResults.data.find((result) => {
            return result.key === "requestType";
        }),
        purchaseType = purchaseResults.data.find((result) => {
            return result.key === "requestType";
        }),
        loginType = loginResults.data.find((result) => {
            return result.key === "requestType";
        }),
        conversionType = conversionResults.data.find((result) => {
            return result.key === "requestType";
        }),
        miscType = miscResults.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(pageViewType.value, "Page View");
    t.is(purchaseType.value, "purchase");
    t.is(loginType.value, "login");
    t.is(conversionType.value, "Conversion");
    t.is(miscType.value, "example");
});