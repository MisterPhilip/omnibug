import test from 'ava';

import { default as GoogleAnalyticsProvider } from "./../source/providers/GoogleAnalytics.js";
import { OmnibugProvider } from "./../source/providers.js";

test("GoogleAnalyticsProvider returns provider information", t => {
    let provider = new GoogleAnalyticsProvider();
    t.is(provider.key, "UNIVERSALANALYTICS", "Key should always be UNIVERSALANALYTICS");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("GoogleAnalyticsProvider pattern should match various UA domains", t => {
    let provider = new GoogleAnalyticsProvider(),
        urls = [
            "https://www.google-analytics.com/collect?v=2&tid=UA-1234567-1",
            "https://www.google-analytics.com/r/collect?v=2&tid=UA-1234567-2",
            "https://www.google-analytics.com/j/collect?v=2&tid=UA-1234567-2",
            "http://www.google-analytics.com/collect?v=2&tid=UA-1234567-2",
            "http://www.google-analytics.com/collect",
            "http://www.analytics.google.com/collect",
        ],
        negativeUrls = [
            "https://omnibug.io/testing",
            "https://omnibug.io/collection",
            "https://omnibug.io/collect?v=2&foo=bar",
            "https://omnibug.io/collect/?foo=bar",
            "https://e.clarity.ms/collect",
            "https://foo.appspot.com/collect?v=2&tid=G-1234567",
            "https://foo.appspot.com/g/collect?v=2&tid=G-1234567",
            "https://foo.appspot.com/r/collect?v=2&tid=G-1234567",
            "https://foo.appspot.com/j/collect?v=2&tid=G-1234567",
            "http://www.google-analytics.com/g/collect?v=2&tid=G-1234567",
            "https://analytics.google.com/g/collect?v=2&tid=G-1234567",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns GoogleAnalytics", t => {
    let url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "UNIVERSALANALYTICS", "Results provider is Universal Analytics");
});

test("GoogleAnalyticsProvider returns static data", t => {
    let provider = new GoogleAnalyticsProvider(),
        url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "UNIVERSALANALYTICS", "Results provider is Universal Analytics");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("GoogleAnalyticsProvider returns the hit type", t => {
    let provider = new GoogleAnalyticsProvider(),
        url1 = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316",
        url2 = "https://www.google-analytics.com/collect",
        postData = "v=2&tid=G-RJZRDLSZR5&gtm=2oe7v2&_p=1844589572&sr=2560x1440&cid=1473268947.1550531325&ul=en-us&_s=1&en=page_view&sid=1565188190&sct=2&seg=1&dl=https%3A%2F%2Fomnibug.io%2Ftest&dr=&dt=Omnibug%20test%20page",
        results1 = provider.parseUrl(url1),
        results2 = provider.parseUrl(url2, postData);

    let requestType1 = results1.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType2 = results2.data.find((result) => {
            return result.key === "omnibug_requestType";
        });

    t.is(typeof requestType1, "object");
    t.is(requestType1.value, "Page View");
    t.is(typeof requestType2, "object");
    t.is(requestType2.value, "page view");
});

test("GoogleAnalyticsProvider returns POST data", t => {
    let provider = new GoogleAnalyticsProvider(),
        url = "https://www.google-analytics.com/collect",
        postData = "v=1&_v=j68&a=40871850&t=event&_s=2&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&ec=exit%20link&ea=click&el=https%3A%2F%2Ftwitter.com%2Fomnibug&_u=CACAAUAB~&jid=&gjid=&cid=191425359.1527202446&tid=UA-17508125-8&_gid=1457163284.1531235778&gtm=u6c&z=1127167073";

    let results = provider.parseUrl(url, postData);

    let eventCategory = results.data.find((result) => {
        return result.key === "ec";
    });
    t.is(typeof eventCategory, "object");
    t.is(eventCategory.field, "Event Category");
    t.is(eventCategory.value, "exit link");
    t.is(eventCategory.group, "events");
});

test("GoogleAnalyticsProvider returns content groups", t => {
    let provider = new GoogleAnalyticsProvider(),
        url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316&cd3=foobar&cm1=12.20&cg5=example%20content%20group";

    let results = provider.parseUrl(url);

    let cg5 = results.data.find((result) => {
        return result.key === "cg5";
    });

    t.is(typeof cg5, "object");
    t.is(cg5.field, "Content Group 5");
    t.is(cg5.value, "example content group");
    t.is(cg5.group, "contentgroup");
});

test.todo("GoogleAnalyticsProvider returns promotions");
test.todo("GoogleAnalyticsProvider returns products");
test.todo("GoogleAnalyticsProvider returns products custom dimensions/metrics");
test.todo("GoogleAnalyticsProvider returns impression lists");
test.todo("GoogleAnalyticsProvider returns impression lists with product-level custom dimensions/metrics");
test.todo("GoogleAnalyticsProvider returns impression lists with product-level information");
