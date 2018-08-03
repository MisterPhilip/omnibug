import test from 'ava';

import { default as AdobeTargetProvider } from "./../source/providers/AdobeTarget.js";
import { OmnibugProvider } from "./../source/providers.js";
import {default as AdobeAnalyticsProvider} from "../source/providers/AdobeAnalytics";

test("AdobeTargetProvider returns provider information", t => {
    let provider = new AdobeTargetProvider();
    t.is(provider.key, "ADOBETARGET", "Key should always be ADOBETARGET");
    t.is(provider.type, "UX Testing", "Type should always be UX Testing");
    t.is(provider.name, "Adobe Target", "Name should be returned as Adobe Target");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("AdobeTargetProvider pattern should match Adobe Target domains", t => {
    let provider = new AdobeTargetProvider(),
        urls = [
            "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard",
            "https://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard",
            "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/json",
            "https://omnibug.tt.omtrdc.net/m2/omnibug/mbox/json"
        ],
        ignoreUrls = [
            "https://omnibug.io/testing",
            "https://cdn.tt.omtrdc.net/cdn/target.js"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    ignoreUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns AdobeAnalytics", t => {
    let url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard?mboxHost=omnibug.io&mbox=foobar";

    let results = OmnibugProvider.parseUrl(url);
    t.is(results.provider.key, "ADOBETARGET", "Results provider should be Adobe Target");
});

test("AdobeTargetProvider returns static data", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard?mboxHost=omnibug.io&mbox=foobar";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results should have provider information");
    t.is(results.provider.key, "ADOBETARGET", "Results provider is Adobe Target");
    t.is(typeof results.data, "object", "Results should have data");
    t.true(results.data.length > 0, "Data should be returned");
});

test("AdobeTargetProvider returns static data", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard?mboxHost=omnibug.io&mbox=foobar";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results should have provider information");
    t.is(results.provider.key, "ADOBETARGET", "Results provider is Adobe Target");
    t.is(typeof results.data, "object", "Results should have data");

    let mboxHost = results.data.find((result) => {
        return result.key === "mboxHost";
    });
    t.is(mboxHost.field, "Page Host", "Page Host should be returned");
    t.is(mboxHost.value, "omnibug.io", "Page Host should be omnibug.io");
});

test("AdobeTargetProvider returns custom data", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard?mboxHost=omnibug.io&mbox=foobar";

    let results = provider.parseUrl(url),
        mboxType = results.data.find((result) => {
            return result.key === "mboxType";
        }),
        clientCode = results.data.find((result) => {
            return result.key === "clientCode";
        });
    t.is(mboxType.field, "Mbox Type", "Mbox type should be returned");
    t.is(mboxType.value, "standard", "Mbox type should be standard");
    t.is(clientCode.field, "Client Code", "Client code should be returned");
    t.is(clientCode.value, "omnibug", "Client code should be clientCode");
});

test("AdobeTargetProvider returns profile dataa", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/standard?mboxHost=omnibug.io&mbox=foobar&profile.user=Philip&profile.account=123456";

    let results = provider.parseUrl(url),
        user = results.data.find((result) => {
            return result.key === "profile.user";
        }),
        account = results.data.find((result) => {
            return result.key === "profile.account";
        });
    t.is(user.field, "user");
    t.is(user.value, "Philip");
    t.is(user.group, "profile");
    t.is(account.field, "account");
    t.is(account.value, "123456");
    t.is(account.group, "profile");
});

test("AdobeTargetProvider handles missing mbox or clientCode", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/?mboxHost=omnibug.io&mbox=foobar";


    let results = provider.parseUrl(url),
        mboxType = results.data.find((result) => {
            return result.key === "mboxType";
        }),
        clientCode = results.data.find((result) => {
            return result.key === "clientCode";
        });
    t.is(typeof mboxType, "undefined", "Mbox type should be not returned");
    // @TODO:
    //t.is(clientCode.field, "Client Code", "Client code should be returned");
    //t.is(clientCode.value, "omnibug", "Client code should be clientCode");
});

test("Provider returns POST data", t => {
    let provider = new AdobeTargetProvider(),
        url = "http://omnibug.tt.omtrdc.net/m2/omnibug/mbox/json",
        postData = {"mbox": ["target_global_mbox"], "mboxVersion": ["1.3.0"], "profile.testing": ["testing123"]};

    let results = provider.parseUrl(url, postData);

    let mboxVersion = results.data.find((result) => {
            return result.key === "mboxVersion";
        }),
        profileTesting = results.data.find((result) => {
            return result.key === "profile.testing";
        });

    t.is(typeof mboxVersion, "object");
    t.is(mboxVersion.field, "Library Version");
    t.is(mboxVersion.value, "1.3.0");
    t.is(mboxVersion.group, "general");

    t.is(typeof profileTesting, "object");
    t.is(profileTesting.value, "testing123");
});