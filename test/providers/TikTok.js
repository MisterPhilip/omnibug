import test from 'ava';

import { default as TikTokProvider } from "../source/providers/TikTok";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "TIKTOK";

test("TikTokProvider returns provider information", (t) => {
    let provider = new TikTokProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be TIKTOK");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name === "TikTok", "Name should be TikTok");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("TikTokProvider pattern should match call for TikTok events", t => {
    let provider = new TikTokProvider(),
        urls = [
            "https://analytics.tiktok.com/api/v1/track",
            "https://analytics.tiktok.com/api/v2/track"
        ],
        badUrls = [
            "https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=BT24PR2UH19GN34U0RP0",
            "https://analytics.tiktok.com/",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns TikTok", t => {
    let provider = new TikTokProvider(),
        url = "https://analytics.tiktok.com/api/v1/track",
        postData = {"event":"AddToCart","context":{"ad":{"ad_id":"","req_id":"","creative_id":"","log_extra":"{}","idc":"","convert_id":"","callback":""},"user":{"user_id":"","device_id":""},"pixel":{"code":"BT24M8TQUU2IQ2BVG9NG"},"page":{"url":"https%3A%2F%2Fdigital-intelligence.myshopify.com%2F","referrer":""},"library":{"version":"0.0.24","name":"pixel.js"}},"analytics_uniq_id":"f1udvvnn6gt0jhsn6wirp3q","timestamp":"2020-09-04T11:22:12.961Z"},
        results = provider.parseUrl(url, postData);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is TikTok");
});

test("TikTokProvider returns requestType", t => {
    let provider = new TikTokProvider(),
        url = "https://analytics.tiktok.com/api/v1/track",
        viewContentPostData = {"event":"ViewContent","context":{"ad":{"ad_id":"","req_id":"","creative_id":"","log_extra":"{}","idc":"","convert_id":"","callback":""},"user":{"user_id":"","device_id":""},"pixel":{"code":"BT24M8TQUU2IQ2BVG9NG"},"page":{"url":"https%3A%2F%2Fdigital-intelligence.myshopify.com%2F","referrer":""},"library":{"version":"0.0.24","name":"pixel.js"}},"analytics_uniq_id":"yhczscrde4u6oe9lpmuns","timestamp":"2020-09-04T11:22:12.959Z"},
        purchasePostData = {"event":"Purchase","context":{"ad":{"ad_id":"","req_id":"","creative_id":"","log_extra":"{}","idc":"","convert_id":"","callback":""},"user":{"user_id":"","device_id":""},"pixel":{"code":"BT24M8TQUU2IQ2BVG9NG"},"page":{"url":"https%3A%2F%2Fdigital-intelligence.myshopify.com%2F","referrer":""},"library":{"version":"0.0.24","name":"pixel.js"}},"analytics_uniq_id":"mtcrxyl78c2gtebpccznh","timestamp":"2020-09-04T11:22:12.959Z"},
        checkoutPostData = {"event":"Checkout","context":{"ad":{"ad_id":"","req_id":"","creative_id":"","log_extra":"{}","idc":"","convert_id":"","callback":""},"user":{"user_id":"","device_id":""},"pixel":{"code":"BT24M8TQUU2IQ2BVG9NG"},"page":{"url":"https%3A%2F%2Fdigital-intelligence.myshopify.com%2F","referrer":""},"library":{"version":"0.0.24","name":"pixel.js"}},"analytics_uniq_id":"ty67gzsy1disrvnmos4zx","timestamp":"2020-09-04T11:22:12.958Z"},
        viewContentParsed = provider.parseUrl(url, viewContentPostData),
        purchaseParsed = provider.parseUrl(url, purchasePostData),
        checkoutParsed = provider.parseUrl(url, checkoutPostData),
        viewContentResult = viewContentParsed.data.find((result) => {
            return result.key === "event";
        }),
        purchaseResult = purchaseParsed.data.find((result) => {
            return result.key === "event";
        }),
        checkoutResult = checkoutParsed.data.find((result) => {
            return result.key === "event";
        });

    t.is(typeof viewContentResult, "object");
    t.is(viewContentResult.value, "ViewContent");

    t.is(typeof purchaseResult, "object");
    t.is(purchaseResult.value, "Purchase");

    t.is(typeof checkoutResult, "object");
    t.is(checkoutResult.value, "Checkout");
});

test("TikTokProvider handles bad data", t => {
    let provider = new TikTokProvider(),
        url = "https://analytics.tiktok.com/api/v1/track",
        postData = {"event":"","context":{"ad":{"ad_id":"","req_id":"","creative_id":"","log_extra":"{}","idc":"","convert_id":"","callback":""},"user":{"user_id":"","device_id":""},"pixel":{"code":"BT24M8TQUU2IQ2BVG9NG"},"page":{"url":"https%3A%2F%2Fdigital-intelligence.myshopify.com%2F","referrer":""},"library":{"version":"0.0.24","name":"pixel.js"}},"analytics_uniq_id":"ty67gzsy1disrvnmos4zx","timestamp":"2020-09-04T11:22:12.958Z"},
        parsed = provider.parseUrl(url, postData),
        eventData = parsed.data.find((result) => {
            return result.key === "event";
        });
    
    t.is(typeof eventData, "object");
    t.is(eventData.value, "");
});