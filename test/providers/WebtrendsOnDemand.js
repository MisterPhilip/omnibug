import test from 'ava';

import { default as WebtrendsOnDemand } from "./../source/providers/WebtrendsOnDemand.js";
import { OmnibugProvider } from "./../source/providers.js";

test("WebtrendsOnDemand returns provider information", (t) => {
    let provider = new WebtrendsOnDemand();
    t.is(provider.key, "WEBTRENDSONDEMAND", "Key should always be WEBTRENDSONDEMAND");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("WebtrendsOnDemand pattern should match WT calls", t => {
    let provider = new WebtrendsOnDemand(),
        urls = [
            "https://statse.webtrendslive.com/dcs222y7nq6k81h24nxtc6793_2k1d/dcs.gif?&dcsdat=1566720825934",
            "https://pdx-sdc.webtrends.com/dcs222y7nq6k81h24nxtc6793_2k1d/dcs.gif?&dcsdat=1566720825934",
        ],
        badUrls = [
            "https:/webtrends.com/",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns WebtrendsOnDemand", t => {
    let url = "https://statse.webtrendslive.com/dcs222y7nq6k81h24nxtc6793_2k1d/dcs.gif?&dcsdat=1566720825934",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "WEBTRENDSONDEMAND", "Results provider is WebtrendsOnDemand");
});

test("WebtrendsOnDemand returns dynamic data", t => {
    let provider = new WebtrendsOnDemand(),
        url = "https://statse.webtrendslive.com/dcs222y7nq6k81h24nxtc6793_2k1d/dcs.gif?&dcsdat=1566720825934&dcssip=www.webtrends.com&dcsuri=/about-us/contact-us/&dcsref=https://www.webtrends.com/analytics-for-sharepoint/&WT.tz=-7&WT.bh=1&WT.ul=en-US&WT.cd=24&WT.sr=2560x1440&WT.jo=No&WT.ti=Contact%2520Us%2520%25E2%2580%2593%2520Webtrends&WT.js=Yes&WT.jv=1.5&WT.ct=unknown&WT.bs=2560x1297&WT.fv=Not%2520enabled&WT.slv=Not%2520enabled&WT.le=UTF-8&WT.tv=10.4.23&WT.dl=0&WT.ssl=1&WT.es=www.webtrends.com%252Fabout-us%252Fcontact-us%252F&WT.ce=2&WT.vt_f_tlh=1566720670&WT.vtvs=1566719753718&WT.vtid=2422f3f3-1139-4608-b81e-db1a337673c2&WT.co_f=2422f3f3-1139-4608-b81e-db1a337673c2&WT.hdr.Accept=*%2F*&WT.seg_1=seg1&WT.seg_3=test123",
        resultsEventType = provider.parseUrl(url).data.find((result) => {
            return result.key === "WT.dl";
        }),
        resultsHeader = provider.parseUrl(url).data.find((result) => {
            return result.key === "WT.hdr.Accept";
        }),
        resultsSegment = provider.parseUrl(url).data.find((result) => {
            return result.key === "WT.seg_3";
        });

    t.is(typeof resultsEventType, "object");
    t.is(resultsEventType.value, "0 (Page View)");

    t.is(typeof resultsHeader, "object");
    t.is(resultsHeader.value, "*/*");

    t.is(typeof resultsSegment, "object");
    t.is(resultsSegment.value, "test123");
});

test("WebtrendsOnDemand returns account ID when exists", t => {
    let provider = new WebtrendsOnDemand(),
        withAccount = "https://statse.webtrendslive.com/dcs222y7nq6k81h24nxtc6793_2k1d/dcs.gif?&dcsdat=1566720825934&dcssip=www.webtrends.com&dcsuri=/about-us/contact-us/&dcsref=https://www.webtrends.com/analytics-for-sharepoint/&WT.tz=-7&WT.bh=1&WT.ul=en-US&WT.cd=24&WT.sr=2560x1440&WT.jo=No&WT.ti=Contact%2520Us%2520%25E2%2580%2593%2520Webtrends&WT.js=Yes&WT.jv=1.5&WT.ct=unknown&WT.bs=2560x1297&WT.fv=Not%2520enabled&WT.slv=Not%2520enabled&WT.le=UTF-8&WT.tv=10.4.23&WT.dl=0&WT.ssl=1&WT.es=www.webtrends.com%252Fabout-us%252Fcontact-us%252F&WT.ce=2&WT.vt_f_tlh=1566720670&WT.vtvs=1566719753718&WT.vtid=2422f3f3-1139-4608-b81e-db1a337673c2&WT.co_f=2422f3f3-1139-4608-b81e-db1a337673c2",
        withoutAccount = "https://omnibug.io/dcs.gif?&dcsdat=1566721059991&dcssip=twitter.com&dcsuri=/webtrends&dcsref=https://www.webtrends.com/about-us/contact-us/&WT.tz=-7&WT.bh=1&WT.ul=en-US&WT.cd=24&WT.sr=2560x1440&WT.jo=No&WT.ti=Offsite%253Atwitter.com%252Fwebtrends&WT.js=Yes&WT.jv=1.5&WT.ct=unknown&WT.bs=2560x1297&WT.fv=Not%2520enabled&WT.slv=Not%2520enabled&WT.le=UTF-8&WT.tv=10.4.23&WT.dl=24&WT.ssl=1&WT.es=www.webtrends.com%252Fabout-us%252Fcontact-us%252F&WT.ce=2&WT.vt_f_tlh=1566720825&WT.vtvs=1566719753718&WT.vtid=2422f3f3-1139-4608-b81e-db1a337673c2&WT.co_f=2422f3f3-1139-4608-b81e-db1a337673c2&WT.nv=fusion-social-networks-wrapper",
        resultsWithAccount = provider.parseUrl(withAccount).data.find((result) => {
            return result.key === "accountID";
        }),
        resultsWithoutAccount = provider.parseUrl(withoutAccount).data.find((result) => {
            return result.key === "accountID";
        });

    t.is(typeof resultsWithAccount, "object");
    t.is(resultsWithAccount.value, "dcs222y7nq6k81h24nxtc6793_2k1d");

    t.is(typeof resultsWithoutAccount, "undefined");
});
