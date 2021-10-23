import test from 'ava';

import { default as MicrosoftClarityProvider } from "./../source/providers/MicrosoftClarity.js";
import { OmnibugProvider } from "./../source/providers.js";

test("MicrosoftClarityProvider returns provider information", t => {
    let provider = new MicrosoftClarityProvider();
    t.is(provider.key, "MSCLARITY", "Key should always be MSCLARITY");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("MicrosoftClarityProvider pattern should match the loader script", t => {
    let provider = new MicrosoftClarityProvider(),
        urls = [
            "https://www.clarity.ms/tag/4fc7usxxxx"
        ],
        negativeUrls = [
            "https://www.google-analytics.com/collect",
            "https://www.google-analytics.com/collect?v=1&_v=j94&a=1213487135&t=event",
            "https://omnibug.io/collect?v=2&foo=bar",
            "https://omnibug.io/collect/?foo=bar",
            "https://e.clarity.ms/collect",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns MicrosoftClarityProvider", t => {
    let url = "https://www.clarity.ms/tag/4fc7usxxxx";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "MSCLARITY", "Results provider is Microsoft Clarity");
});

test("MicrosoftClarityProvider returns static data", t => {
    let provider = new MicrosoftClarityProvider(),
        url = "https://www.clarity.ms/tag/4fc7usxxxx";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "MSCLARITY", "Results provider is Microsoft Clarity");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");

    let account = results.data.find((result) => {
        return result.key === "account";
    });

    t.is(account.value, "4fc7usxxxx");
});
