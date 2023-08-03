import test from 'ava';

import { default as RudderStackProvider } from "./../source/providers/RudderStack.js";
import { OmnibugProvider } from "./../source/providers.js";

test("RudderStackProvider returns provider information", (t) => {
    let provider = new RudderStackProvider();
    t.is(provider.key, "RUDDERSTACK", "Key should always be RUDDERSTACK");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("RudderStackProvider pattern should match RudderStack calls", t => {
    let provider = new RudderStackProvider(),
        urls = [
            "https://rudderstack-dataplane.rudderstack.com/v1/page",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns RudderStack", t => {
    let url = "https://rudderstack-dataplane.rudderstack.com/v1/page",
        postData = `{"properties":{"branch":"main","timezone":{"name":"Etc/GMT+7"},"gclid":"","utm_referrer":"","name":"page_view","path":"/","referrer":"https://www.rudderstack.com/docs/","referring_domain":"www.rudderstack.com","search":"","title":"The Warehouse Native Customer Data Platform","url":"https://www.rudderstack.com/","tab_url":"https://www.rudderstack.com/","initial_referrer":"https://github.com/MisterPhilip/omnibug/issues/223","initial_referring_domain":"github.com"},"name":"page_view","type":"page","anonymousId":"4b7853b8-39e7-4b6b-a2c0-a1399f2295c5","channel":"web","context":{"traits":{},"sessionId":1691099679123,"consentManagement":{},"app":{"name":"RudderLabs JavaScript SDK","namespace":"com.rudderlabs.javascript","version":"3.0.0-beta.1"},"library":{"name":"RudderLabs JavaScript SDK","version":"3.0.0-beta.1"},"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36","os":{"name":"","version":""},"locale":"en-US","screen":{"width":2560,"height":1440,"density":1,"innerWidth":1278,"innerHeight":1281},"campaign":{},"page":{"path":"/","referrer":"https://www.rudderstack.com/docs/","referring_domain":"www.rudderstack.com","search":"","title":"The Warehouse Native Customer Data Platform","url":"https://www.rudderstack.com/","tab_url":"https://www.rudderstack.com/","initial_referrer":"https://github.com/MisterPhilip/omnibug/issues/223","initial_referring_domain":"github.com"}},"originalTimestamp":"2023-08-03T22:11:27.209Z","integrations":{"All":true},"messageId":"2c11a389-7ef4-47c3-88a7-157d16dddee5","userId":"","sentAt":"2023-08-03T22:11:27.219Z"}`;
    let results = OmnibugProvider.parseUrl(url, postData);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "RUDDERSTACK", "Results provider is RudderStack");
});

test("RudderStackProvider returns custom data", t => {
    let provider = new RudderStackProvider(),
        url = "https://rudderstack-dataplane.rudderstack.com/v1/page",
        postData = `{"properties":{"branch":"main","timezone":{"name":"Etc/GMT+7"},"gclid":"","utm_referrer":"","name":"page_view","path":"/","referrer":"https://www.rudderstack.com/docs/","referring_domain":"www.rudderstack.com","search":"","title":"The Warehouse Native Customer Data Platform","url":"https://www.rudderstack.com/","tab_url":"https://www.rudderstack.com/","initial_referrer":"https://github.com/MisterPhilip/omnibug/issues/223","initial_referring_domain":"github.com"},"name":"page_view","type":"page","anonymousId":"4b7853b8-39e7-4b6b-a2c0-a1399f2295c5","channel":"web","context":{"traits":{},"sessionId":1691099679123,"consentManagement":{},"app":{"name":"RudderLabs JavaScript SDK","namespace":"com.rudderlabs.javascript","version":"3.0.0-beta.1"},"library":{"name":"RudderLabs JavaScript SDK","version":"3.0.0-beta.1"},"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36","os":{"name":"","version":""},"locale":"en-US","screen":{"width":2560,"height":1440,"density":1,"innerWidth":1278,"innerHeight":1281},"campaign":{},"page":{"path":"/","referrer":"https://www.rudderstack.com/docs/","referring_domain":"www.rudderstack.com","search":"","title":"The Warehouse Native Customer Data Platform","url":"https://www.rudderstack.com/","tab_url":"https://www.rudderstack.com/","initial_referrer":"https://github.com/MisterPhilip/omnibug/issues/223","initial_referring_domain":"github.com"}},"originalTimestamp":"2023-08-03T22:11:27.209Z","integrations":{"All":true},"messageId":"2c11a389-7ef4-47c3-88a7-157d16dddee5","userId":"","sentAt":"2023-08-03T22:11:27.219Z"}`;

    let results = provider.parseUrl(url, postData),
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

test.todo("RudderStackProvider returns static data");
test.todo("RudderStackProvider has columnMappings");
