import test from 'ava';

import { default as SegmentProvider } from "./../source/providers/Segment.js";
import { OmnibugProvider } from "./../source/providers.js";

test("SegmentProvider returns provider information", (t) => {
    let provider = new SegmentProvider();
    t.is(provider.key, "SEGMENT", "Key should always be SEGMENT");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("SegmentProvider pattern should match Segment calls", t => {
    let provider = new SegmentProvider(),
        urls = [
            "https://api.segment.io/v1/p",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns Segment", t => {
    let url = "https://api.segment.io/v1/p",
        postData = "{\"context\":{\"page\":{\"path\":\"/\",\"referrer\":\"https://segment.com/docs/spec/\",\"search\":\"\",\"title\":\"Analytics API and Customer Data Platform · Segment\",\"url\":\"https://segment.com/\"},\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36\",\"library\":{\"name\":\"analytics.js\",\"version\":\"3.6.0\"},\"traits\":{\"crossDomainId\":\"cf27eea9-a5a7-43dd-b551-ea3c2bc6d4a8\"}},\"integrations\":{},\"properties\":{\"name\":\"Home\",\"path\":\"/\",\"referrer\":\"https://segment.com/docs/spec/\",\"search\":\"\",\"title\":\"Analytics API and Customer Data Platform · Segment\",\"url\":\"https://segment.com/\"},\"category\":null,\"name\":\"Home\",\"anonymousId\":\"7e5c1f1f-bf99-4725-809d-67785f64933b\",\"timestamp\":\"2018-05-27T23:55:54.383Z\",\"type\":\"page\",\"writeKey\":\"zaySL4FGIiLsxt3I7omU5uLxXqxaBMPh\",\"userId\":\"ZHN2cGWPCP\",\"sentAt\":\"2018-05-27T23:55:54.386Z\",\"_metadata\":{\"bundled\":[\"AdWords\",\"Amplitude\",\"Drift\",\"Drip\",\"Facebook Pixel\",\"Google Analytics\",\"Google Tag Manager\",\"LinkedIn Insight Tag\",\"Madkudu\",\"Segment.io\",\"Twitter Ads\",\"Visual Website Optimizer\"],\"unbundled\":[\"Marketo V2\",\"Customer.io\"]},\"messageId\":\"ajs-bb485b9778f0ddcff39debbb6f5eaf1e\"}";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "SEGMENT", "Results provider is Segment");
});

test("SegmentProvider returns custom data", t => {
    let provider = new SegmentProvider(),
        url = "https://api.segment.io/v1/p",
        postData = "{\"context\":{\"page\":{\"path\":\"/\",\"referrer\":\"https://segment.com/docs/spec/\",\"search\":\"\",\"title\":\"Analytics API and Customer Data Platform · Segment\",\"url\":\"https://segment.com/\"},\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36\",\"library\":{\"name\":\"analytics.js\",\"version\":\"3.6.0\"},\"traits\":{\"crossDomainId\":\"cf27eea9-a5a7-43dd-b551-ea3c2bc6d4a8\"}},\"integrations\":{},\"properties\":{\"name\":\"Home\",\"path\":\"/\",\"referrer\":\"https://segment.com/docs/spec/\",\"search\":\"\",\"title\":\"Analytics API and Customer Data Platform · Segment\",\"url\":\"https://segment.com/\"},\"category\":null,\"name\":\"Home\",\"anonymousId\":\"7e5c1f1f-bf99-4725-809d-67785f64933b\",\"timestamp\":\"2018-05-27T23:55:54.383Z\",\"type\":\"page\",\"writeKey\":\"zaySL4FGIiLsxt3I7omU5uLxXqxaBMPh\",\"userId\":\"ZHN2cGWPCP\",\"sentAt\":\"2018-05-27T23:55:54.386Z\",\"_metadata\":{\"bundled\":[\"AdWords\",\"Amplitude\",\"Drift\",\"Drip\",\"Facebook Pixel\",\"Google Analytics\",\"Google Tag Manager\",\"LinkedIn Insight Tag\",\"Madkudu\",\"Segment.io\",\"Twitter Ads\",\"Visual Website Optimizer\"],\"unbundled\":[\"Marketo V2\",\"Customer.io\"]},\"messageId\":\"ajs-bb485b9778f0ddcff39debbb6f5eaf1e\"}";

    let results = provider.parseUrl(url),
        action = results.data.find((result) => {
            return result.key === "omnibug_requestType";
        });
    t.is(typeof action, "object");
    t.is(action.value, "Page");

    // @TODO types:
    // identify
    // track
    // screen
    // group
    // alias
    // batch
});

test.todo("SegmentProvider returns static data");
test.todo("SegmentProvider has columnMappings");