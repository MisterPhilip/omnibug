import test from 'ava';

import { default as SplitIOProvider } from "../source/providers/SplitIO";
import { OmnibugProvider } from "../source/providers.js";

const providerKey = "SPLITIO";

test("SplitIO returns provider information", (t) => {
    let provider = new SplitIOProvider();
    t.is(provider.key, providerKey, "Key should always be SPLITIO");
    t.is(provider.type, "Analytics", "Type should always be Analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("SplitIOProvider pattern should match SplitIO calls", t => {
    let provider = new SplitIOProvider(),
        urls = [
            "https://events.split.io/api/events/bulk",
            "https://events.split.io/api/testImpressions/bulk",
            "https://events.split.io/api/events/beacon",
            "https://events.split.io/api/testImpressions/beacon",
            "https://events.split.io/api/testImpressions/count/beacon"
        ],
        badUrls = [
            "https://example.org",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns SplitIO", t => {
    let url = "https://events.split.io/api/events/bulk",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, providerKey, "Results provider is SplitIO");
});

test("SplitIOProvider returns data for events", t => {
    let provider = new SplitIOProvider(),
        url = "https://events.split.io/api/events/bulk",
        postData = '[{"eventTypeId":"mockEventName","trafficTypeName":"anonymous","timestamp":1673729811404,"key":"mockKey","properties":{"attribute":"mockAttributeValue"}}]',
        results = provider.parseUrl(url, postData),
        eventName = results.data.find((result) => result.key === "eventName"),
        eventProperties = results.data.find((result) => result.key === "eventProperties");

    t.is(typeof eventName, "object");
    t.is(eventName.field, "Event 1 Name");
    t.is(eventName.value, "mockEventName");

    t.is(typeof eventProperties, "object");
    t.is(eventProperties.field, "Event 1 Properties");
    t.is(eventProperties.value, `{\n  "attribute": "mockAttributeValue"\n}`);
});

test("SplitIOProvider returns data for impressions", t => {
    let provider = new SplitIOProvider(),
        url = "https://events.split.io/api/testImpressions/count/beacon",
        postData = '{"entries":{"pf":[{"f":"mockSplitName","m":1673730000000,"rc":2}]},"token":"mockToken","sdk":"mockSdk"}',
        results = provider.parseUrl(url, postData),
        splitName = results.data.find((result) => result.key === "splitName");

    t.is(typeof splitName, "object");
    t.is(splitName.field, "Split 1 Name");
    t.is(splitName.value, "mockSplitName");
});
