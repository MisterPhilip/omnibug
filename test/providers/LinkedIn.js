import test from 'ava';

import { default as LinkedInProvider } from "../source/providers/LinkedIn";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "LINKEDINPIXEL";

test("LinkedInProvider returns provider information", (t) => {
    let provider = new LinkedInProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be LinkedIn");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("LinkedInProvider pattern should match LinkedIn calls", t => {
    let provider = new LinkedInProvider(),
        urls = [
            "https://px.ads.linkedin.com/collect/?pid=123456&conversionId=987654&fmt=gif",
            "https://px.ads.linkedin.com/collect?v=2&fmt=js&pid=123456&url=https%3A%2F%2Fwww.example.com%2F&time=1583871950665"
        ],
        badUrls = [
            "https://snap.licdn.com/li.lms-analytics/insight.min.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns LinkedIn", t => {
    let url = "https://px.ads.linkedin.com/collect?v=2&fmt=js&pid=123456&url=https%3A%2F%2Fwww.example.com%2F&time=1583871950665",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is LinkedIn");
});

test("LinkedInProvider returns data", t => {
    let provider = new LinkedInProvider(),
        url = "https://px.ads.linkedin.com/collect/?pid=123456&conversionId=987654&fmt=gif",
        results = provider.parseUrl(url),
        tagID = results.data.find((result) => {
            return result.key === "pid";
        }),
        conversionID = results.data.find((result) => {
            return result.key === "conversionId";
        });

    t.is(typeof tagID, "object");
    t.is(tagID.field, "Pixel ID");
    t.is(tagID.value, "123456");

    t.is(typeof conversionID, "object");
    t.is(conversionID.field, "Conversion ID");
    t.is(conversionID.value, "987654");
});