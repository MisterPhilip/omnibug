import test from 'ava';

import { default as AdobeDynamicTagManagerProvider } from "./../source/providers/AdobeDynamicTagManager.js";
import { OmnibugProvider } from "./../source/providers.js";
import {default as AdobeLaunchProvider} from "../source/providers/AdobeLaunch";

test("AdobeDynamicTagManagerProvider returns provider information", (t) => {
    let provider = new AdobeDynamicTagManagerProvider();
    t.is(provider.key, "ADOBEDTM", "Key should always be ADOBEDTM");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("AdobeDynamicTagManagerProvider pattern should match Adobe Launch calls", t => {
    let provider = new AdobeDynamicTagManagerProvider(),
        urls = [
            "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/satelliteLib-1111116d88efd63b1ea96c9cb1c66bddc1b4a182.js",
            "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/satelliteLib-1111116d88efd63b1ea96c9cb1c66bddc1b4a182-staging.js"
        ],
        badUrls = [
            "https://assets.adobedtm.com/launch-ENf3494c5e66666d119e0e439ecc59e176.min.js",
            "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/dil-contents-11111e89a5e2ad685907fd41359492d74c69f85-staging.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Adobe DTM", t => {
    let url = "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/satelliteLib-1111116d88efd63b1ea96c9cb1c66bddc1b4a182.js",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEDTM", "Results provider is Adobe DTM");
});

test("AdobeDynamicTagManagerProvider returns custom data", t => {
    let provider = new AdobeDynamicTagManagerProvider(),
        stagingUrl = "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/satelliteLib-1111116d88efd63b1ea96c9cb1c66bddc1b4a182-staging.jss",
        prodUrl = "https://assets.adobedtm.com/11111101610a457aec67bc8bf59d3464fcf8acd2/satelliteLib-1111116d88efd63b1ea96c9cb1c66bddc1b4a182.js",
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