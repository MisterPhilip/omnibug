import test from 'ava';

import { default as InvocaProvider } from "./../source/providers/Invoca.js";
import { OmnibugProvider } from "./../source/providers.js";

test("InvocaProvider returns provider information", t => {
    let provider = new InvocaProvider();
    t.is(provider.key, "INVOCA", "Key should always be INVOCA");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("InvocaProvider pattern should match the loader script", t => {
    let provider = new InvocaProvider(),
        urls = [
            "https://solutions.invocacdn.com/js/networks/1234/123123123/tag-live.js",
            "https://solutions.invocacdn.com/js/networks/1234/123123123/tag-draft.js"
        ],
        negativeUrls = [
            "https://static.invoca.com/file.js"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns InvocaProvider", t => {
    let url = "https://solutions.invocacdn.com/js/networks/1234/123123123/tag-live.js";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "INVOCA", "Results provider is Invoca");
});

test("InvocaProvider returns static data", t => {
    let provider = new InvocaProvider(),
        url = "https://solutions.invocacdn.com/js/networks/1234/123123123/tag-live.js";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "INVOCA", "Results provider is Invoca");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");

    let account = results.data.find((result) => {
        return result.key === "account";
    });

    t.is(account.value, "1234/123123123");
});
