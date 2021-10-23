import test from 'ava';

import { default as HotjarProvider } from "./../source/providers/Hotjar.js";
import { OmnibugProvider } from "./../source/providers.js";

test("HotjarProvider returns provider information", t => {
    let provider = new HotjarProvider();
    t.is(provider.key, "HOTJAR", "Key should always be HOTJAR");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("HotjarProvider pattern should match the loader script", t => {
    let provider = new HotjarProvider(),
        urls = [
            "https://static.hotjar.com/c/hotjar-123456.js?sv=5"
        ],
        negativeUrls = [
            "https://static.hotjar.com/file.js"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns HotjarProvider", t => {
    let url = "https://static.hotjar.com/c/hotjar-123456.js?sv=5";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "HOTJAR", "Results provider is Hotjar");
});

test("HotjarProvider returns static data", t => {
    let provider = new HotjarProvider(),
        url = "https://static.hotjar.com/c/hotjar-123456.js?sv=5";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "HOTJAR", "Results provider is Hotjar");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");

    let account = results.data.find((result) => {
        return result.key === "account";
    });

    t.is(account.value, "123456");
});
