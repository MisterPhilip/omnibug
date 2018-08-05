import test from 'ava';

import { default as TealiumIQProvider } from "./../source/providers/TealiumIQ.js";
import { OmnibugProvider } from "./../source/providers.js";

test("TealiumIQProvider returns provider information", (t) => {
    let provider = new TealiumIQProvider();
    t.is(provider.key, "TEALIUMIQ", "Key should always be TEALIUMIQ");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("TealiumIQProvider pattern should match Tealium calls", t => {
    let provider = new TealiumIQProvider(),
        urls = [
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.js",
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.js?cacheBuster=1234",
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.sync.js",
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.sync.js?cacheBuster=1234"
        ],
        badUrls = [
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.123.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns TealiumIQ", t => {
    let url = "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.js",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "TEALIUMIQ", "Results provider is TealiumIQ");
});

test("TealiumIQProvider returns custom data", t => {
    let provider = new TealiumIQProvider(),
        url = "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.sync.js",
        results = provider.parseUrl(url),
        account = results.data.find((result) => {
            return result.key === "omnibug_account";
        }),
        env = results.data.find((result) => {
            return result.key === "environment";
        });

    t.is(typeof account, "object");
    t.is(account.value, "omnibug / main");

    t.is(typeof env, "object");
    t.is(env.value, "prod");
});

test("TealiumIQProvider returns request type", t => {
    let provider = new TealiumIQProvider(),
        urlSync = "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.sync.js",
        urlAsync = "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.js",
        resultsSync = provider.parseUrl(urlSync).data.find((result) => {
            return result.key === "requestType";
        }),
        resultsAsnyc = provider.parseUrl(urlAsync).data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof resultsSync, "object");
    t.is(resultsSync.value, "Sync");

    t.is(typeof resultsAsnyc, "object");
    t.is(resultsAsnyc.value, "Async");
});