import test from 'ava';

import { default as GoogleAnalytics4Provider } from "./../source/providers/GoogleAnalytics4.js";
import { OmnibugProvider } from "./../source/providers.js";

test("GoogleAnalytics4Provider returns provider information", t => {
    let provider = new GoogleAnalytics4Provider();
    t.is(provider.key, "GOOGLEANALYTICS4", "Key should always be GOOGLEANALYTICS4");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("GoogleAnalytics4Provider pattern should match various UA domains", t => {
    let provider = new GoogleAnalytics4Provider(),
        urls = [
            "https://www.google-analytics.com/g/collect",
            "https://www.google-analytics.com/g/collect/",
            "https://www.google-analytics.com/g/collect#",
            "https://www.google-analytics.com/g/collect?v=2&tid=G-1234567",
            "https://analytics.google.com/g/collect",
            "https://analytics.google.com/g/collect?v=2&tid=G-1234567",
            "https://foo.appspot.com/g/collect/",
            "https://foo.appspot.com/g/collect?v=2&tid=G-1234567",
        ],
        negativeUrls = [
            "https://omnibug.io/testing",
            "https://omnibug.io/collection",
            "https://omnibug.io/collect?v=2&foo=bar",
            "https://omnibug.io/collect/?foo=bar",
            "https://e.clarity.ms/collect",
            "http://www.google-analytics.com/collect?v=2&tid=UA-1234567",
            "http://www.google-analytics.com/collect/",
            "https://www.google-analytics.com/collect/",
            "https://www.google-analytics.com/collect",
            "https://analytics.google.com/collect",
            "https://analytics.google.com/r/collect",
            "https://analytics.google.com/j/collect",
            "https://foo.appspot.com/collect",
            "https://foo.appspot.com/r/collect",
            "https://foo.appspot.com/j/collect",
            "https://foo.appspot.com/collect/",
            "https://foo.appspot.com/r/collect/",
            "https://foo.appspot.com/j/collect/",
            "https://stats.g.doubleclick.net/g/collect?v=2&tid=G-1234567",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns GoogleAnalytics", t => {
    let url = "https://www.google-analytics.com/g/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=G-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "GOOGLEANALYTICS4", "Results provider is Universal Analytics");
});

test("GoogleAnalytics4Provider returns static data", t => {
    let provider = new GoogleAnalytics4Provider(),
        url = "https://www.google-analytics.com/g/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=G-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "GOOGLEANALYTICS4", "Results provider is Universal Analytics");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("GoogleAnalytics4Provider returns the hit type", t => {
    let provider = new GoogleAnalytics4Provider(),
        url1 = "https://custom.omnibug.io/g/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=G-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316",
        url2 = "https://www.google-analytics.com/g/collect?v=2&tid=G-123456&gtm=2oe7v2&_p=1844589572&sr=2560x1440&cid=1473268947.1550531325&ul=en-us&_s=1&en=page_view&sid=1565188190&sct=2&seg=1&dl=https%3A%2F%2Fomnibug.io%2Ftest&dr=&dt=Omnibug%20test%20page",
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

test("GoogleAnalytics4Provider returns POST data", t => {
    let provider = new GoogleAnalytics4Provider(),
        url = "https://www.google-analytics.com/g/collect?tid=G-123456",
        postData = "v=1&_v=j68&a=40871850&t=event&_s=2&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&ec=exit%20link&ea=click&el=https%3A%2F%2Ftwitter.com%2Fomnibug&_u=CACAAUAB~&jid=&gjid=&cid=191425359.1527202446&_gid=1457163284.1531235778&gtm=u6c&z=1127167073";

    let results = provider.parseUrl(url, postData);

    let eventCategory = results.data.find((result) => {
        return result.key === "ec";
    });
    t.is(typeof eventCategory, "object");
    t.is(eventCategory.field, "Event Category");
    t.is(eventCategory.value, "exit link");
    t.is(eventCategory.group, "events");
});

test("GoogleAnalytics4Provider returns App+Web POST data", t => {
    let provider = new GoogleAnalytics4Provider(),
        url = "https://www.google-analytics.com/g/collect?v=2&tid=G-123456&gtm=2oe871&_p=1075024922&sr=2560x1440&ul=en-us&cid=309365347.1597524282&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fappweb.html&dr=&dt=Omnibug%20App%2BWeb%20Test&sid=1597524282&sct=1&seg=1&_s=1",
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

test("GoogleAnalytics4Provider returns content groups", t => {
    let provider = new GoogleAnalytics4Provider(),
        url = "https://www.google-analytics.com/g/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=G-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316&cd3=foobar&cm1=12.20&cg5=example%20content%20group";

    let results = provider.parseUrl(url);

    let cg5 = results.data.find((result) => {
        return result.key === "cg5";
    });

    t.is(typeof cg5, "object");
    t.is(cg5.field, "Content Group 5");
    t.is(cg5.value, "example content group");
    t.is(cg5.group, "contentgroup");
});

test.todo("GoogleAnalytics4Provider returns promotions");
test.todo("GoogleAnalytics4Provider returns products");
test.todo("GoogleAnalytics4Provider returns products custom dimensions/metrics");
test.todo("GoogleAnalytics4Provider returns impression lists");
test.todo("GoogleAnalytics4Provider returns impression lists with product-level custom dimensions/metrics");
test.todo("GoogleAnalytics4Provider returns impression lists with product-level information");
