import test from 'ava';

import { default as CriteoOneTagProvider } from "../source/providers/CriteoOneTag";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "CRITEOONETAG";

test("CriteoOneTagProvider returns provider information", (t) => {
    let provider = new CriteoOneTagProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be Criteo OneTag");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("CriteoOneTagProvider pattern should match Criteo OneTag calls", t => {
    let provider = new CriteoOneTagProvider(),
        urls = [
            "https://sslwidget.criteo.com/event?a=123456&v=5.5.0&p0=e%3Dexd%26site_type%3Dm&p1=e%3Dce%26m%3D%255Btest%252540test.com%255D&p2=e%3Dvh&p3=e%3Ddis&adce=1&tld=localhost&dtycbr=95232",
        ],
        badUrls = [
            "https://static.criteo.net/js/ld/ld.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Criteo OneTag", t => {
    let url = "https://sslwidget.criteo.com/event?a=123456&v=5.5.0&p0=e%3Dexd%26site_type%3Dm&p1=e%3Dce%26m%3D%255Btest%252540test.com%255D&p2=e%3Dvh&p3=e%3Ddis&adce=1&tld=localhost&dtycbr=95232",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Criteo OneTag");
});

test("CriteoOneTagProvider returns data", t => {
    let provider = new CriteoOneTagProvider(),
        url = "https://sslwidget.criteo.com/event?a=123456&v=5.5.0&p0=e%3Dexd%26site_type%3Dm&p1=e%3Dce%26m%3D%255Btest%252540test.com%255D&p2=e%3Dvh&p3=e%3Ddis&adce=1&tld=localhost&dtycbr=95232",
        results = provider.parseUrl(url),
        accountID = results.data.find((result) => {
            return result.key === "a";
        }),
        hashedEmail = results.data.find((result) => {
            return result.key === "p0";
        });

    t.is(typeof accountID, "object");
    t.is(accountID.field, "Account ID");
    t.is(accountID.value, "123456");

    t.is(typeof hashedEmail, "object");
    t.is(hashedEmail.field, "p0");
    t.is(hashedEmail.value, "e=exd&site_type=m");
});

test("CriteoOneTagProvider returns requestType", t => {
    let provider = new CriteoOneTagProvider(),
        homepageUrl = "https://sslwidget.criteo.com/event?a=123456&v=5.5.0&p0=e%3Dexd%26site_type%3Dm&p1=e%3Dce%26m%3D%255Btest%252540test.com%255D&p2=e%3Dvh&p3=e%3Ddis&adce=1&tld=localhost&dtycbr=95232",
        purchaseUrl = "https://sslwidget.criteo.com/event?a=123456&v=5.5.0&p0=e%3Dvc%26c%3DJPY%26id%3DG555999%26p%3D%255Bi%25253DA122%252526pr%25253D44.9%252526q%25253D2%252Ci%25253DF5532%252526pr%25253D85%252526q%25253D1%255D&p1=e%3Dexd%26site_type%3Dm&p2=e%3Ddis&adce=1&tld=localhost&dtycbr=42055",
        homepageRequest = provider.parseUrl(homepageUrl),
        purchaseRequest = provider.parseUrl(purchaseUrl),
        homepageResult = homepageRequest.data.find((result) => {
            return result.key === "requestType";
        }),
        purchaseResult = purchaseRequest.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof homepageResult, "object");
    t.is(homepageResult.value, "Homepage");

    t.is(typeof purchaseResult, "object");
    t.is(purchaseResult.value, "Purchase");
});