import test from 'ava';

import { default as AdobeAudienceManagerProvider } from "./../source/providers/AdobeAudienceManager.js";
import { OmnibugProvider } from "./../source/providers.js";

test("AdobeAudienceManagerProvider returns provider information", t => {
    let provider = new AdobeAudienceManagerProvider();
    t.is(provider.key, "ADOBEAUDIENCEMANAGER", "Key should always be ADOBEAUDIENCEMANAGER");
    t.is(provider.type, "Visitor Identification", "Type should always be visitor ID");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("Pattern should match various Adobe Audience Manager domains", t => {
    let provider = new AdobeAudienceManagerProvider(),
        urls = [
            "https://dpm.demdex.net/ibs:dpid=411&dpuuid=XMclygAA21BdkXJN",
            "https://omnibug.demdex.net/ibs:dpid=411&dpuuid=XMclygAA21BdkXJN",
            "https://dpm.demdex.net/event?d_uuid=1&d_cts=2&d_rtbd=json",
            "https://omnibug.demdex.net/event?d_uuid=1&d_cts=2&d_rtbd=json"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
    t.false(provider.checkUrl("https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&d_orgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189"), "Provider should not match on non-provider based URLs");
});

test("Omnibug Provider returns AdobeAudienceManagerProvider", t => {
    let url = "https://dpm.demdex.net/ibs:dpid=411&dpuuid=XMclygAA21BdkXJN",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEAUDIENCEMANAGER", "Results provider is Adobe Audience Manager");
});

test("AdobeAudienceManagerProvider returns static data", t => {
    let provider = new AdobeAudienceManagerProvider(),
        url = "https://dpm.demdex.net/ibs:d_dpid=411&dpuuid=XMclygAA21BdkXJN",
        results = provider.parseUrl(url),

        dpid = results.data.find((result) => {
            return result.key === "d_dpid";
        }),
        dpuuid = results.data.find((result) => {
            return result.key === "dpuuid";
        });

    t.is(typeof dpid, "object");
    t.is(dpid.field, "Data Provider ID");
    t.is(dpid.value, "411");
    t.is(dpid.group, "general");

    t.is(typeof dpuuid, "object");
    t.is(dpuuid.field, "Data Provider User ID");
    t.is(dpuuid.value, "XMclygAA21BdkXJN");
    t.is(dpuuid.group, "general");
});

test("AdobeAudienceManagerProvider returns custom data", t => {
    let provider = new AdobeAudienceManagerProvider(),
        url = "https://omnibug.demdex.net/event?d_uuid=23257951693413580990920086422942111113&d_cts=2&d_rtbd=json&c_test=abc123&p_age=20",
        results = provider.parseUrl(url),

        c_test = results.data.find((result) => {
            return result.key === "c_test";
        }),
        p_age = results.data.find((result) => {
            return result.key === "p_age";
        });

    t.is(typeof c_test, "object");
    t.is(c_test.field, "c_test");
    t.is(c_test.value, "abc123");
    t.is(c_test.group, "custom");

    t.is(typeof p_age, "object");
    t.is(p_age.field, "p_age");
    t.is(p_age.value, "20");
    t.is(p_age.group, "private");
});