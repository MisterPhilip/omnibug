import test from 'ava';

import { default as TwitterProvider } from "../source/providers/Twitter";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "TWITTERPIXEL";

test("TwitterProvider returns provider information", (t) => {
    let provider = new TwitterProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be Twitter");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("TwitterProvider pattern should match Twitter calls", t => {
    let provider = new TwitterProvider(),
        urls = [
            "https://analytics.twitter.com/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&events=%5B%5B%22pageview%22%2Cnull%5D%5D&tw_sale_amount=0&tw_order_quantity=0&tw_iframe_status=0&tpx_cb=twttr.conversion.loadPixels&tw_document_href=https%3A%2F%2Fwww.example.com%2F",
        ],
        badUrls = [
            "https://static.ads-twitter.com/uwt.js",
            "https://t.co/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&events=%5B%5B%22pageview%22%2Cnull%5D%5D&tw_sale_amount=0&tw_order_quantity=0&tw_iframe_status=0",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Twitter", t => {
    let url = "https://analytics.twitter.com/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&events=%5B%5B%22pageview%22%2Cnull%5D%5D&tw_sale_amount=0&tw_order_quantity=0&tw_iframe_status=0&tpx_cb=twttr.conversion.loadPixels&tw_document_href=https%3A%2F%2Fwww.example.com%2F",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Twitter");
});

test("TwitterProvider returns data", t => {
    let provider = new TwitterProvider(),
        url = "https://analytics.twitter.com/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&events=%5B%5B%22pageview%22%2Cnull%5D%5D&tw_sale_amount=0&tw_order_quantity=0&tw_iframe_status=0&tpx_cb=twttr.conversion.loadPixels&tw_document_href=https%3A%2F%2Fwww.example.com%2F",
        results = provider.parseUrl(url),
        tagID = results.data.find((result) => {
            return result.key === "txn_id";
        }),
        hashedEmail = results.data.find((result) => {
            return result.key === "p_user_id";
        });

    t.is(typeof tagID, "object");
    t.is(tagID.field, "Tag ID");
    t.is(tagID.value, "abc123");

    t.is(typeof hashedEmail, "object");
    t.is(hashedEmail.field, "User ID");
    t.is(hashedEmail.value, "0");
});

test("TwitterProvider returns requestType", t => {
    let provider = new TwitterProvider(),
        pageViewUrl = "https://analytics.twitter.com/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&events=%5B%5B%22pageview%22%2Cnull%5D%5D&tw_sale_amount=0&tw_order_quantity=0&tw_iframe_status=0&tpx_cb=twttr.conversion.loadPixels&tw_document_href=https%3A%2F%2Fwww.example.com%2F",
        purchaseUrl = "https://analytics.twitter.com/i/adsct?p_id=Twitter&p_user_id=0&txn_id=abc123&tw_sale_amount=29.95&tw_order_quantity=3&events=%5B%5B%22purchase%22%2C%7B%22value%22%3A%2229.95%22%2C%22currency%22%3A%22USD%22%2C%22num_items%22%3A%223%22%7D%5D%5D&tw_iframe_status=0&tpx_cb=twttr.conversion.loadPixels&tw_document_href=https%3A%2F%2Fwww.example.com%2F",
        pageViewRequest = provider.parseUrl(pageViewUrl),
        purchaseRequest = provider.parseUrl(purchaseUrl),
        pageViewResult = pageViewRequest.data.find((result) => {
            return result.key === "requestType";
        }),
        purchaseResult = purchaseRequest.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof pageViewResult, "object");
    t.is(pageViewResult.value, "Page View");

    t.is(typeof purchaseResult, "object");
    t.is(purchaseResult.value, "purchase");
});