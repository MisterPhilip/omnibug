import test from 'ava';

import { default as GoogleDoubleClickProvider } from "./../source/providers/GoogleDoubleClick.js";
import { OmnibugProvider } from "./../source/providers.js";

test("GoogleDoubleClickProvider returns provider information", (t) => {
    let provider = new GoogleDoubleClickProvider();
    t.is(provider.key, "DOUBLECLICK", "Key should always be DOUBLECLICK");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("GoogleDoubleClickProvider pattern should match DC calls", t => {
    let provider = new GoogleDoubleClickProvider(),
        urls = [
            "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
            "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;ord=8104016085288;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?"
        ],
        badUrls = [
            "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1111111/?random=846177263&cv=9&fst=*&num=1&label=AbC-D_efG-h12_34-567&bg=ffffff&guid=ON&resp=GooglemKTybQhCsO&u_h=1440&u_w=2560&u_ah=1400&u_aw=2560&u_cd=24&u_his=2&u_tz=-420&u_java=false&u_nplug=3&u_nmime=4&gtm=2ou430&sendb=1&data=event%3Dpurchase%3Ballow_custom_scripts%3Dtrue&frm=0&url=https://omnibug.io/&tiba=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&async=1&fmt=3&ctc_id=CAIVAgAAAB0CAAAA&ct_cookie_present=false&ocp_id=BLrEXM3MC6KonAf3x6yQCw&crd=&gtd=",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns DoubleClick", t => {
    let url = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "DOUBLECLICK", "Results provider is DoubleClick");
});

test("GoogleDoubleClickProvider returns data", t => {
    let provider = new GoogleDoubleClickProvider(),
        url = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        results = provider.parseUrl(url),
        cost = results.data.find((result) => {
            return result.key === "cost";
        }),
        src = results.data.find((result) => {
            return result.key === "src";
        }),
        account = results.data.find((result) => {
            return result.key === "omnibug-account";
        }),
        oref = results.data.find((result) => {
            return result.key === "~oref";
        });

    t.is(typeof cost, "object");
    t.is(cost.value, "666.66");

    t.is(typeof src, "object");
    t.is(src.field, "Account ID");
    t.is(src.value, "1234567");

    t.is(typeof account, "object");
    t.is(account.value, "DC-1234567/group1/thank123");

    t.is(typeof oref, "object");
    t.is(oref.field, "Page URL");
    t.is(oref.value, "https://omnibug.io/");
});

test("GoogleDoubleClickProvider returns custom data fields", t => {
    let provider = new GoogleDoubleClickProvider(),
        url = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;u1=test123;u10=123test;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        results = provider.parseUrl(url),
        u1 = results.data.find((result) => {
            return result.key === "u1";
        }),
        u10 = results.data.find((result) => {
            return result.key === "u10";
        });

    t.is(typeof u1, "object");
    t.is(u1.field, "Custom Field 1");
    t.is(u1.value, "test123");
    t.is(u1.group, "custom");

    t.is(typeof u10, "object");
    t.is(u10.field, "Custom Field 10");
    t.is(u10.value, "123test");
    t.is(u10.group, "custom");
});

test("GoogleDoubleClickProvider returns transaction data", t => {
    let provider = new GoogleDoubleClickProvider(),
        url = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;qty=1;cost=666.66;ord=xact111;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        results = provider.parseUrl(url),
        qty = results.data.find((result) => {
            return result.key === "qty";
        }),
        ord = results.data.find((result) => {
            return result.key === "ord";
        }),
        countingMethod = results.data.find((result) => {
            return result.key === "countingMethod";
        });

    t.is(typeof qty, "object");
    t.is(qty.value, "1");

    t.is(typeof ord, "object");
    t.is(ord.field, "Transaction ID");
    t.is(ord.value, "xact111");

    t.is(typeof countingMethod, "object");
    t.is(countingMethod.field, "Counting Method");
    t.is(countingMethod.value, "transactions / items_sold");
});

test("GoogleDoubleClickProvider returns counting method", t => {
    let provider = new GoogleDoubleClickProvider(),
        standardUrl = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;ord=8104016085288;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        uniqueUrl = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;ord=1;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",
        sessionUrl = "https://1234567.fls.doubleclick.net/activityi;src=1234567;type=group1;cat=thank123;gtm=2ou430;auiddc=890045014.1556389977;~oref=https%3A%2F%2Fomnibug.io%2F?",

        standardResults = provider.parseUrl(standardUrl),
        uniqueResults = provider.parseUrl(uniqueUrl),
        sessionResults = provider.parseUrl(sessionUrl),
        standard = standardResults.data.find((result) => {
            return result.key === "countingMethod";
        }),
        standardOrd = standardResults.data.find((result) => {
            return result.key === "ord";
        }),
        unique = uniqueResults.data.find((result) => {
            return result.key === "countingMethod";
        }),
        uniqueOrd = uniqueResults.data.find((result) => {
            return result.key === "ord";
        }),
        session = sessionResults.data.find((result) => {
            return result.key === "countingMethod";
        }),
        sessionOrd = sessionResults.data.find((result) => {
            return result.key === "ord";
        });

    t.is(standard.value, "standard");
    t.is(standardOrd.field, "Counting Method Type");
    t.is(unique.value, "unique");
    t.is(uniqueOrd.field, "Counting Method Type");
    t.is(session.value, "per_session");
    t.is(typeof sessionOrd, "undefined");
});