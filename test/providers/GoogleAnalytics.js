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
            "https://www.google-analytics.com/collect?",
            "http://www.google-analytics.com/collect?",
            "http://www.google-analytics.com/collect/",
            "https://www.google-analytics.com/collect/?",
            "http://www.google-analytics.com/g/collect",
            "http://www.google-analytics.com/g/collect?",
            "http://www.google-analytics.com/g/collect/",
            "https://www.google-analytics.com/g/collect/?",
            "https://www.google-analytics.com/collect",
            "https://analytics.google.com/g/collect",
            "https://analytics.google.com/g/collect?",
            "http://analytics.google.com/g/collect",
            "http://analytics.google.com/g/collect?"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
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
        url2 = "https://www.google-analytics.com/g/collect?v=2&tid=G-RJZRDLSZR5&gtm=2oe7v2&_p=1844589572&sr=2560x1440&cid=1473268947.1550531325&ul=en-us&_s=1&en=page_view&sid=1565188190&sct=2&seg=1&dl=https%3A%2F%2Fomnibug.io%2Ftest&dr=&dt=Omnibug%20test%20page",
        results1 = provider.parseUrl(url1),
        results2 = provider.parseUrl(url2);

    let requestType1 = results1.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType2 = results2.data.find((result) => {
            return result.key === "omnibug_requestType";
        });

    t.is(typeof requestType1, "object");
    t.is(requestType1.value, "Page View");
    t.is(typeof requestType2, "object");
    t.is(requestType2.value, "Page View");
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

test("GoogleAnalyticsProvider returns App+Web POST data", t => {
    let provider = new GoogleAnalyticsProvider(),
        url = "https://www.google-analytics.com/g/collect?v=2&tid=G-HLPY6C0G1N&gtm=2oe871&_p=1075024922&sr=2560x1440&ul=en-us&cid=309365347.1597524282&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fappweb.html&dr=&dt=Omnibug%20App%2BWeb%20Test&sid=1597524282&sct=1&seg=1&_s=1",
        postData = "en=page_view en=scroll&epn.percent_scrolled=90";

    let results = provider.parseUrl(url, postData);

    let event1Type = results.data.find((result) => {
        return result.key === "en[0]";
    });
    let scrollDepth = results.data.find((result) => {
        return result.key === "epn[1].percent_scrolled";
    });
    t.is(typeof scrollDepth, "object");
    t.is(scrollDepth.field, "Event 2 Data (percent_scrolled)");
    t.is(scrollDepth.value, "90");
    t.is(scrollDepth.group, "events");
});

test("GoogleAnalyticsProvider returns custom dimensions/metrics", t => {
    let provider = new GoogleAnalyticsProvider(),
        url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316&cd3=foobar&cm1=12.20";

    let results = provider.parseUrl(url);

    let cm1 = results.data.find((result) => {
        return result.key === "cm1";
    });

    t.is(typeof cm1, "object");
    t.is(cm1.field, "Custom Metric 1");
    t.is(cm1.value, "12.20");
    t.is(cm1.group, "metric");

    let cd3 = results.data.find((result) => {
        return result.key === "cd3";
    });

    t.is(typeof cd3, "object");
    t.is(cd3.field, "Custom Dimension 3");
    t.is(cd3.value, "foobar");
    t.is(cd3.group, "dimension");
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
