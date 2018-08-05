import test from 'ava';

import { default as EnsightenManageProvider } from "./../source/providers/EnsightenManage.js";
import { OmnibugProvider } from "./../source/providers.js";

test("EnsightenManageProvider returns provider information", (t) => {
    let provider = new EnsightenManageProvider();
    t.is(provider.key, "ENSIGHTENMANAGE", "Key should always be ENSIGHTENMANAGE");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("EnsightenManageProvider pattern should match Ensighten calls", t => {
    let provider = new EnsightenManageProvider(),
        urls = [
            "https://nexus.ensighten.com/omnibug/Bootstrap.js",
            "https://nexus.ensighten.com/omnibug/OmnibugProd/Bootstrap.js",
            "https://nexus.ensighten.com/omnibug/OmnibugProd/Bootstrap.js?cacheBuster=1234"
        ],
        badUrls = [
            "https://nexus.ensighten.com/omnibug/OmnibugProd/serverComponent.php",
            "https://nexus.ensighten.com/omnibug/OmnibugProd/code/123456789.js?conditionId0=123456"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Ensighten Manage", t => {
    let url = "https://nexus.ensighten.com/omnibug/OmnibugProd/Bootstrap.js",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ENSIGHTENMANAGE", "Results provider is Ensighten Manage");
});

test("EnsightenManageProvider returns custom data", t => {
    let provider = new EnsightenManageProvider(),
        url = "https://nexus.ensighten.com/omnibug/OmnibugProd/Bootstrap.js",
        results = provider.parseUrl(url),
        account = results.data.find((result) => {
            return result.key === "omnibug_account";
        });

    t.is(typeof account, "object");
    t.is(account.value, "omnibug / OmnibugProd");
});

test("EnsightenManageProvider returns profile when missing", t => {
    let provider = new EnsightenManageProvider(),
        url = "https://nexus.ensighten.com/omnibug/Bootstrap.js",
        results = provider.parseUrl(url),
        client = results.data.find((result) => {
            return result.key === "client";
        }),
        profile = results.data.find((result) => {
            return result.key === "profile";
        });

    t.is(typeof client, "object");
    t.is(client.value, "omnibug");

    t.is(typeof profile, "object");
    t.is(profile.value, "prod");
});