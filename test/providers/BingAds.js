import test from 'ava';

import { default as BingAdsProvider } from "../source/providers/BingAds";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "BINGUET";

test("BingAdsProvider returns provider information", (t) => {
    let provider = new BingAdsProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be Bing Ads");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("BingAdsProvider pattern should match Bing Ads calls", t => {
    let provider = new BingAdsProvider(),
        urls = [
            "https://bat.bing.com/action/0?ti=123456&Ver=2&mid=eeb8884c-7abb-0791-3ae6-6348dd889664&pi=1200101525&lg=en-US&sw=2560&sh=1440&sc=24&tl=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&kw=Omnibug%20browser%20extension%20debug%20web%20metrics%20analytics%20Adobe%20Analytics%20Target%20Omniture%20SiteCatalyst%20Moniforce%20WebTrends%20Google%20Urchin&p=https%3A%2F%2Fomnibug.io%2F&r=&lt=590&evt=pageLoad&msclkid=N&rn=187899",
        ],
        badUrls = [
            "https://bat.bing.com/bat.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Bing Ads", t => {
    let url = "https://bat.bing.com/action/0?ti=123456&Ver=2&mid=fd5b9ab1-d3b8-eb02-f4ce-de6b18ee358c&page_path=%2Fspa_page&spa=Y&p=https%3A%2F%2Fomnibug.io%2Fspa_page&pi=1200101525&lg=en-US&sw=2560&sh=1440&sc=24&tl=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&kw=Omnibug%20browser%20extension%20debug%20web%20metrics%20analytics%20Adobe%20Analytics%20Target%20Omniture%20SiteCatalyst%20Moniforce%20WebTrends%20Google%20Urchin&r=https%3A%2F%2Fomnibug.io%2F&evt=pageLoad&msclkid=N&rn=123456",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Bing Ads");
});

test("BingAdsProvider returns data", t => {
    let provider = new BingAdsProvider(),
        url = "https://bat.bing.com/action/0?ti=123456&Ver=2&mid=fd5b9ab1-d3b8-eb02-f4ce-de6b18ee358c&page_path=%2Fspa_page&spa=Y&p=https%3A%2F%2Fomnibug.io%2Fspa_page&pi=1200101525&lg=en-US&sw=2560&sh=1440&sc=24&tl=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&kw=Omnibug%20browser%20extension%20debug%20web%20metrics%20analytics%20Adobe%20Analytics%20Target%20Omniture%20SiteCatalyst%20Moniforce%20WebTrends%20Google%20Urchin&r=https%3A%2F%2Fomnibug.io%2F&evt=pageLoad&msclkid=N&rn=123456",
        results = provider.parseUrl(url),
        tagID = results.data.find((result) => {
            return result.key === "ti";
        }),
        hashedEmail = results.data.find((result) => {
            return result.key === "page_path";
        });

    t.is(typeof tagID, "object");
    t.is(tagID.field, "Tag ID");
    t.is(tagID.value, "123456");

    t.is(typeof hashedEmail, "object");
    t.is(hashedEmail.field, "Page Path");
    t.is(hashedEmail.value, "/spa_page");
});

test("BingAdsProvider returns requestType", t => {
    let provider = new BingAdsProvider(),
        pageViewUrl = "https://bat.bing.com/action/0?ti=123456&Ver=2&mid=fd5b9ab1-d3b8-eb02-f4ce-de6b18ee358c&page_path=%2Fspa_page&spa=Y&p=https%3A%2F%2Fomnibug.io%2Fspa_page&pi=1200101525&lg=en-US&sw=2560&sh=1440&sc=24&tl=Omnibug%20%7C%20A%20Digital%20Marketing%20Debugging%20Tool&kw=Omnibug%20browser%20extension%20debug%20web%20metrics%20analytics%20Adobe%20Analytics%20Target%20Omniture%20SiteCatalyst%20Moniforce%20WebTrends%20Google%20Urchin&r=https%3A%2F%2Fomnibug.io%2F&evt=pageLoad&msclkid=N&rn=123456",
        eventUrl = "https://bat.bing.com/action/0?ti=123456&Ver=2&mid=eeb8884c-7abb-0791-3ae6-6348dd889664&ec=Ecommerce&ea=Purchase&el=Successful%20Sale&ev=0&gv=123.34&el2=Successful%20Sale&evt=custom&msclkid=N&rn=693067",
        pageViewRequest = provider.parseUrl(pageViewUrl),
        eventRequest = provider.parseUrl(eventUrl),
        pageViewResult = pageViewRequest.data.find((result) => {
            return result.key === "requestType";
        }),
        eventResult = eventRequest.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof pageViewResult, "object");
    t.is(pageViewResult.value, "Page View");

    t.is(typeof eventResult, "object");
    t.is(eventResult.value, "Custom");
});