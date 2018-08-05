import test from 'ava';

import { default as GoogleTagManagerProvider } from "./../source/providers/GoogleTagManager.js";
import { OmnibugProvider } from "./../source/providers.js";

test("GoogleTagManagerProvider returns provider information", (t) => {
    let provider = new GoogleTagManagerProvider();
    t.is(provider.key, "GOOGLETAGMAN", "Key should always be GOOGLETAGMAN");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("GoogleTagManagerProvider pattern should match GTM calls", t => {
    let provider = new GoogleTagManagerProvider(),
        urls = [
            "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123",
            "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123&l=omnibug"
        ],
        badUrls = [
            "https://www.google-analytics.com/gtm/js?id=GTM-ABC123",
            "https://www.googletagmanager.com/gtag/js?id=GTM-ABC123",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns GTM", t => {
    let url = "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "GOOGLETAGMAN", "Results provider is GTM");
});

test("GoogleTagManagerProvider returns custom data", t => {
    let provider = new GoogleTagManagerProvider(),
        url = "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123&l=omnibug",
        results = provider.parseUrl(url),
        account = results.data.find((result) => {
            return result.key === "id";
        }),
        dataLayer = results.data.find((result) => {
            return result.key === "l";
        });

    t.is(typeof account, "object");
    t.is(account.value, "GTM-ABC123");

    t.is(typeof dataLayer, "object");
    t.is(dataLayer.value, "omnibug");
});