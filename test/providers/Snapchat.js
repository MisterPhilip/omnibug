import test from 'ava';

import { default as SnapchatProvider } from "../source/providers/Snapchat";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "SNAPCHATPIXEL";

test("SnapchatProvider returns provider information", (t) => {
    let provider = new SnapchatProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be Snapchat");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("SnapchatProvider pattern should match Snapchat calls", t => {
    let provider = new SnapchatProvider(),
        urls = [
            "https://tr.snapchat.com/p",
        ],
        badUrls = [
            "https://sc-static.net/scevent.min.js",
            "https://tr.snapchat.com/cm/i?pid=b2ade379-a55e-4ca7-893b-b9fac04c843f",
            "https://tr.snapchat.com/cm/p?rand=1583799227113&pnid=110&pcid=",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Snapchat", t => {
    let url = "https://tr.snapchat.com/p",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Snapchat");
});

test("SnapchatProvider returns data", t => {
    let provider = new SnapchatProvider(),
        url = "https://tr.snapchat.com/p",
        postData = "pid=b2ade379-a55e-4ca7-893b-b9fac04c843f&ev=PAGE_VIEW&pl=https%3A%2F%2Fomnibug.io%2F&ts=1583875341291&rf=&v=1.4&if=false&bt=__LIVE__&e_desc=Example+Page&e_sm=foobar&e_su=1&u_hem=f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a&u_hpn=009875cdd7e8a0abe6dc0444d693ff435599e9c68793dac5bc277066d4bc0dc3&u_c1=842d7ddb-e7ea-478c-85a7-cd256905dd2c&m_sl=7889&m_rd=1555565&m_pi=287&m_pl=590&m_ic=0",
        results = provider.parseUrl(url, postData),
        pixelID = results.data.find((result) => {
            return result.key === "pid";
        }),
        hashedEmail = results.data.find((result) => {
            return result.key === "u_hem";
        }),
        requestType = results.data.find((result) => {
            return result.key === "requestType";
        });
    
    t.log(JSON.stringify(results, "\t"));

    t.is(typeof pixelID, "object");
    t.is(pixelID.field, "Pixel ID");
    t.is(pixelID.value, "b2ade379-a55e-4ca7-893b-b9fac04c843f");

    t.is(typeof hashedEmail, "object");
    t.is(hashedEmail.field, "User Email (Hashed)");
    t.is(hashedEmail.value, "f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a");

    t.is(typeof requestType, "object");
    t.is(requestType.value, "Page View");
});