import test from 'ava';

import { default as AdobeExperienceIDProvider } from "./../source/providers/AdobeExperienceID.js";
import { OmnibugProvider } from "./../source/providers.js";

test("AdobeExperienceIDProvider returns provider information", t => {
    let provider = new AdobeExperienceIDProvider();
    t.is(provider.key, "ADOBEEXPERIENCEID", "Key should always be ADOBEEXPERIENCEID");
    t.is(provider.type, "Visitor Identification", "Type should always be visitor ID");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("Pattern should match various Experience Cloud ID Service domains", t => {
    let provider = new AdobeExperienceIDProvider(),
        urls = [
            "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&d_orgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189",
            "https://omnibug.d1.sc.omtrdc.net/id?d_visid_ver=3.3.0&d_fieldgroup=A&mcorgid=12DD457EB547F37590C3198A5%40AdobeOrg&mid=23217789772354355080917241693661203130&ts=1556555212410"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
    t.false(provider.checkUrl("https://dpm.demdex.net/ibs:dpid=411&dpuuid=XMclygAA21BdkXJN"), "Provider should not match on non-provider based URLs");
});

test("Omnibug Provider returns AdobeExperienceIDProvider", t => {
    let url = "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&d_orgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEEXPERIENCEID", "Results provider is Adobe Experience Cloud ID Service");
});

test("AdobeExperienceIDProvider returns an account ID when passed", t => {
    let provider = new AdobeExperienceIDProvider(),
        account1Url = "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&mcorgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189",
        account2Url = "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&d_orgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189",
        noAccountUrl = "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&d_nsid=0&ts=1556555212189",

        account1Results = provider.parseUrl(account1Url),
        account2Results = provider.parseUrl(account2Url),
        noAccountResults = provider.parseUrl(noAccountUrl),

        account1 = account1Results.data.find((result) => {
            return result.key === "omnibug_account";
        }),
        account2 = account2Results.data.find((result) => {
            return result.key === "omnibug_account";
        }),
        noAccount = noAccountResults.data.find((result) => {
            return result.key === "omnibug_account";
        });

    t.is(typeof account1, "object");
    t.is(account1.value, "12DD457EB547F37590C3198A5@AdobeOrg");

    t.is(typeof account2, "object");
    t.is(account2.value, "12DD457EB547F37590C3198A5@AdobeOrg");

    t.is(typeof noAccount, "object");
    t.is(noAccount.value, "");
});

test("AdobeExperienceIDProvider returns static data", t => {
    let provider = new AdobeExperienceIDProvider(),
        url = "https://dpm.demdex.net/id?d_visid_ver=3.3.0&d_fieldgroup=MC&d_rtbd=json&d_ver=2&mcorgid=12DD457EB547F37590C3198A5%40AdobeOrg&d_nsid=0&ts=1556555212189",
        results = provider.parseUrl(url),

        mcorgid = results.data.find((result) => {
            return result.key === "mcorgid";
        }),
        d_rtbd = results.data.find((result) => {
            return result.key === "d_rtbd";
        });

    t.is(typeof mcorgid, "object");
    t.is(mcorgid.field, "Adobe Organization ID");
    t.is(mcorgid.value, "12DD457EB547F37590C3198A5@AdobeOrg");
    t.is(mcorgid.group, "general");

    t.is(typeof d_rtbd, "object");
    t.is(d_rtbd.field, "Return Method");
    t.is(d_rtbd.value, "json");
    t.is(d_rtbd.group, "general");
});