import test from 'ava';

import { default as UniversalAnalyticsProvider } from "./../source/providers/UniversalAnalytics.js";
import { OmnibugProvider } from "./../source/providers.js";

test("UniversalAnalyticsProvider returns provider information", t => {
    let provider = new UniversalAnalyticsProvider();
    t.is(provider.key, "UNIVERSALANALYTICS", "Key should always be UNIVERSALANALYTICS");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("UniversalAnalyticsProvider pattern should match various UA domains", t => {
    let provider = new UniversalAnalyticsProvider(),
        urls = [
            "https://www.google-analytics.com/collect?",
            "http://www.google-analytics.com/collect?",
            "https://stats.g.doubleclick.net/r/collect?",
            "http://stats.g.doubleclick.net/r/collect?"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns UniversalAnalytics", t => {
    let url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "UNIVERSALANALYTICS", "Results provider is Universal Analytics");
});

test("OmnibugProvider returns UniversalAnalytics", t => {
    let url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "UNIVERSALANALYTICS", "Results provider is Universal Analytics");
});

test("UniversalAnalyticsProvider returns static data", t => {
    let provider = new UniversalAnalyticsProvider(),
        url = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "UNIVERSALANALYTICS", "Results provider is Universal Analytics");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("UniversalAnalyticsProvider returns the hit type", t => {
    let provider = new UniversalAnalyticsProvider(),
        pvUrl = "https://www.google-analytics.com/r/collect?v=1&_v=j68&a=1805905905&t=pageview&_s=1&dl=https%3A%2F%2Fomnibug.io%2F&ul=en-us&de=UTF-8&dt=Omnibug%20%3A%3A%20web%20metrics%20debugging%20tool&sd=24-bit&sr=2560x1440&vp=2560x1307&je=0&_u=KCDAAUIh~&jid=441640597&gjid=200209851&cid=191425359.1527202446&tid=UA-17508125-8&_gid=401227809.1529009937&_r=1&gtm=u64&z=1617633316",
        dcUrl = "https://stats.g.doubleclick.net/r/collect?t=dc&aip=1&_r=3&v=1&_v=j68&tid=UA-17508125-1&cid=1920454291.1527480381&jid=988746071&gjid=430872552&_gid=308241203.1529009764&_u=CCCAgAADQ~&z=1277129440"

    let dcResults = provider.parseUrl(dcUrl);

    let dcRequestType = dcResults.data.find((result) => {
        return result.key === "omnibug_requestType";
    });

    t.is(typeof dcRequestType, "object");
    t.is(dcRequestType.value, "DoubleClick");
});

test("UniversalAnalyticsProvider returns custom dimensions/metrics", t => {
    let provider = new UniversalAnalyticsProvider(),
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

test("UniversalAnalyticsProvider returns content groups", t => {
    let provider = new UniversalAnalyticsProvider(),
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

test.todo("UniversalAnalyticsProvider returns promotions");
test.todo("UniversalAnalyticsProvider returns products");
test.todo("UniversalAnalyticsProvider returns products custom dimensions/metrics");
test.todo("UniversalAnalyticsProvider returns impression lists");
test.todo("UniversalAnalyticsProvider returns impression lists with product-level custom dimensions/metrics");
test.todo("UniversalAnalyticsProvider returns impression lists with product-level information");