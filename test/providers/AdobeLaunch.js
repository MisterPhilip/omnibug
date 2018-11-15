import test from 'ava';

import { default as AdobeLaunchProvider } from "./../source/providers/AdobeLaunch.js";
import { OmnibugProvider } from "./../source/providers.js";

test("AdobeLaunchProvider returns provider information", (t) => {
    let provider = new AdobeLaunchProvider();
    t.is(provider.key, "ADOBELAUNCH", "Key should always be ADOBELAUNCH");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("AdobeLaunchProvider pattern should match Adobe Launch calls", t => {
    let provider = new AdobeLaunchProvider(),
        urls = [
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.min.js",
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176-staging.min.js",
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176-development.min.js",
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.js",
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.min.js?cachebuster=1234abc"
        ],
        badUrls = [
            "https://assets.adobedtm.com/satelliteLib-ENf3494c5e66666d119e0e439ecc59e176.js",
            "https://omnibug.io/launch-test.min.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Adobe Launch", t => {
    let url = "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.min.js",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBELAUNCH", "Results provider is Adobe Launch");
});

test("AdobeLaunchProvider returns custom data", t => {
    let provider = new AdobeLaunchProvider(),
        stagingUrl = "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176-staging.min.js",
        prodUrl = "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.min.js",
        stagingResults = provider.parseUrl(stagingUrl),
        prodResults = provider.parseUrl(prodUrl),
        stagingEnv = stagingResults.data.find((result) => {
            return result.key === "environment";
        }),
        prodEnv = prodResults.data.find((result) => {
            return result.key === "environment";
        });

    t.is(typeof stagingEnv, "object");
    t.is(stagingEnv.value, "staging");
    t.is(typeof prodEnv, "object");
    t.is(prodEnv.value, "production");
});