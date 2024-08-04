import test from 'ava';

import { default as SeznamSklikProvider } from "./../source/providers/SeznamSklik.js";
import { OmnibugProvider } from "./../source/providers.js";

test("SeznamSklikProvider returns provider information", (t) => {
    let provider = new SeznamSklikProvider();
    t.is(provider.key, "SEZNAMSKLIK", "Key should always be SEZNAMSKLIK");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("SeznamSklikProvider pattern should match Seznam Sklik calls", t => {
    let provider = new SeznamSklikProvider(),
        urls = [
            "https://c.seznam.cz/retargeting?id=123456",
            "https://c.seznam.cz/conv?id=123456",
            "https://c.seznam.cz/retargeting?id=12459&url=https%3A%2F%2Fwww.airbank.cz%2Fprodukty%2Fbezny-ucet%2F%23CTA-blok&consent=1&ids=%7B%22eid%22%3A%22a40f279af7c58f4f45cfe278bcca0c7495c8d54832e2e5f49e290561759adf56%22%2C%22aid%22%3A%7B%22a1%22%3A%22efdee20065265989efe81f2a00be3469a73cc2a617fc2f009107414f513b0f40%22%2C%22a2%22%3A%22f377db9f1f0af132866afd5c4381512a5c9a3b3a32e9ca2f88f0aced18264568%22%2C%22a3%22%3A%2222b62a09f25b1161e03c6626b6718a9503cd79d27ccfa2f3821db9f4db029f80%22%2C%22a4%22%3A%2268e0776c59a62a5cfc9000a0e9e842cc995d16fb23322ca39617c38505f5b13d%22%2C%22a5%22%3A%22d4c999ae43633bd2036188d2bca68e1be8202b2cc1f3a1c42a728eaff7d2483d%22%7D%2C%22tid%22%3A%7B%22t1%22%3A%22420%22%2C%22t2%22%3A%22c018e42714ef953b76170a9a63357fa975305ea077e832d57db56d57e755a0d0%22%7D%2C%22_version%22%3A1%7D",
            "https://c.seznam.cz/conv?id=10000000&value=199.9&orderId=123456&url=https%3A%2F%2Fwww.airbank.cz%2Fprodukty%2Fbezny-ucet%2F%23CTA-blok&consent=1&conversionHitId=VZUjyGnIIss4lTTEuL9ZQYfMIv3ovPGWw32PrKrqz7fHBlNGw0uyFbQhUOpje8cf9ifFOajRLqw&ids=%7B%22eid%22%3A%22a40f279af7c58f4f45cfe278bcca0c7495c8d54832e2e5f49e290561759adf56%22%2C%22aid%22%3A%7B%22a1%22%3A%22efdee20065265989efe81f2a00be3469a73cc2a617fc2f009107414f513b0f40%22%2C%22a2%22%3A%22f377db9f1f0af132866afd5c4381512a5c9a3b3a32e9ca2f88f0aced18264568%22%2C%22a3%22%3A%2222b62a09f25b1161e03c6626b6718a9503cd79d27ccfa2f3821db9f4db029f80%22%2C%22a4%22%3A%2268e0776c59a62a5cfc9000a0e9e842cc995d16fb23322ca39617c38505f5b13d%22%2C%22a5%22%3A%22d4c999ae43633bd2036188d2bca68e1be8202b2cc1f3a1c42a728eaff7d2483d%22%7D%2C%22tid%22%3A%7B%22t1%22%3A%22420%22%2C%22t2%22%3A%22c018e42714ef953b76170a9a63357fa975305ea077e832d57db56d57e755a0d0%22%7D%2C%22_version%22%3A1%7D"
        ],
        badUrls = [
            "https://www.seznam.cz/retargeting?id=123456",
            "https://www.seznam.cz/conv?id=123456",
            "https://c.imedia.cz/retargeting?id=123456",
            "https://c.seznam.cz/retargeting",
            "https://c.seznam.cz/conv",
            "https://c.seznam.cz/conversion",
            "https://c.seznam.cz/js/rc.js",
            "https://omnibug.io/retargeting?id=123456",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Seznam Sklik", t => {
    let url = "https://c.seznam.cz/retargeting?id=123456",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "SEZNAMSKLIK", "Results provider is Seznam Sklik");
});

test("SeznamSklikProvider returns data", t => {
    let provider = new SeznamSklikProvider(),
        url = "https://c.seznam.cz/conv?id=10000000&value=199.9&orderId=123456&url=https%3A%2F%2Fwww.airbank.cz%2Fprodukty%2Fbezny-ucet%2F%23CTA-blok&consent=1&conversionHitId=VZUjyGnIIss4lTTEuL9ZQYfMIv3ovPGWw32PrKrqz7fHBlNGw0uyFbQhUOpje8cf9ifFOajRLqw&ids=%7B%22eid%22%3A%22a40f279af7c58f4f45cfe278bcca0c7495c8d54832e2e5f49e290561759adf56%22%2C%22aid%22%3A%7B%22a1%22%3A%22efdee20065265989efe81f2a00be3469a73cc2a617fc2f009107414f513b0f40%22%2C%22a2%22%3A%22f377db9f1f0af132866afd5c4381512a5c9a3b3a32e9ca2f88f0aced18264568%22%2C%22a3%22%3A%2222b62a09f25b1161e03c6626b6718a9503cd79d27ccfa2f3821db9f4db029f80%22%2C%22a4%22%3A%2268e0776c59a62a5cfc9000a0e9e842cc995d16fb23322ca39617c38505f5b13d%22%2C%22a5%22%3A%22d4c999ae43633bd2036188d2bca68e1be8202b2cc1f3a1c42a728eaff7d2483d%22%7D%2C%22tid%22%3A%7B%22t1%22%3A%22420%22%2C%22t2%22%3A%22c018e42714ef953b76170a9a63357fa975305ea077e832d57db56d57e755a0d0%22%7D%2C%22_version%22%3A1%7D",
        results = provider.parseUrl(url),
        sznId = results.data.find((result) => {
            return result.key === "id";
        }),
        sznConsent = results.data.find((result) => {
            return result.key === "consent";
        }),
        sznUrl = results.data.find((result) => {
            return result.key === "url";
        });

    t.is(typeof sznId, "object");
    t.is(sznId.field, "id");
    t.is(sznId.value, "10000000");

    t.is(typeof sznConsent, "object");
    t.is(sznConsent.field, "consent");
    t.is(sznConsent.value, "1");

    t.is(typeof sznUrl, "object");
    t.is(sznUrl.field, "url");
    t.is(sznUrl.value, "https://www.airbank.cz/produkty/bezny-ucet/#CTA-blok");
});

test("SeznamSklikProvider returns custom data - requestType", t => {
    let provider = new SeznamSklikProvider(),
        conversionUrl = "https://c.seznam.cz/conv?id=123456",
        retargetingUrl = "https://c.seznam.cz/retargeting?id=123456",
        conversionRequest = provider.parseUrl(conversionUrl),
        retargetingRequest = provider.parseUrl(retargetingUrl),

        conversionResult = conversionRequest.data.find((result) => {
            return result.key === "_requestType";
        }),
        retargetingResult = retargetingRequest.data.find((result) => {
            return result.key === "_requestType";
        });    

    t.is(typeof conversionResult, "object");
    t.is(conversionResult.value, "Conversion");

    t.is(typeof retargetingResult, "object");
    t.is(retargetingResult.value, "Retargeting");
});