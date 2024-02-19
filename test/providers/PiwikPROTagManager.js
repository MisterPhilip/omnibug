import test from 'ava';

import { default as PiwikPROTagManagerProvider } from "../source/providers/PiwikPROTagManager.js";
import { OmnibugProvider } from "../source/providers.js";

test("PiwikPROTagManagerProvider returns provider information", t => {
    let provider = new PiwikPROTagManagerProvider();
    t.is(provider.key, "PIWIKPROTMS");
    t.is(provider.type, "Tag Manager");
    t.is(provider.name, "Piwik PRO Tag Manager");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("PiwikPROTagManagerProvider pattern should match PiwikPRO URLs", t => {
    let provider = new PiwikPROTagManagerProvider(),
        urls = [
            "https://omnibug.piwik.pro/containers/aaa123cc-4f49-11e7-963e-000d3a2a4aaa.js",
        ],
        ignoreUrls = [
            "https://omnibug.io/containers/test.js",
            "https://omnibug.piwik.pro/js/aaa123cc-4f49-11e7-963e-000d3a2a4aaa.js",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), url);
    });

    ignoreUrls.forEach((url) => {
        t.false(provider.checkUrl(url), url);
    });
});

test("OmnibugProvider returns PiwikPROTagManagerProvider", t => {
    let url = "https://omnibug.piwik.pro/containers/aaa123cc-4f49-11e7-963e-000d3a2a4aaa.js";

    let results = OmnibugProvider.parseUrl(url);
    t.is(results.provider.key, "PIWIKPROTMS", "Results provider should be PIWIKPROTMS");
});

test("PiwikPROTagManagerProvider returns static data", t => {
    let provider = new PiwikPROTagManagerProvider(),
        url = "https://omnibug.piwik.pro/containers/aaa123cc-4f49-11e7-963e-000d3a2a4aaa.js";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results should have provider information");
    t.is(results.provider.key, "PIWIKPROTMS");
    t.is(typeof results.data, "object", "Results should have data");
    t.true(results.data.length > 0, "Data should be returned");
});

test("PiwikPROTagManagerProvider returns data", t => {
    let provider = new PiwikPROTagManagerProvider(),
        url = "https://omnibug.piwik.pro/containers/aaa123cc-4f49-11e7-963e-000d3a2a4aaa.js";

    let results = provider.parseUrl(url),
        container_id = results.data.find((result) => {
            return result.key === "container_id";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    t.is(container_id.field, "Container ID");
    t.is(container_id.value, "aaa123cc-4f49-11e7-963e-000d3a2a4aaa");
    t.is(requestType.value, "Library Load");
});
