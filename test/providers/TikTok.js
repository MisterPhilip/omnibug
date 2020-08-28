import test from 'ava';

import { default as TikTokProvider } from "../source/providers/TikTok";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "TIKTOK";

test("TikTokProvider returns provider information", (t) => {
    let provider = new TikTokProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be TIKTOK");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("TikTokProvider pattern should match Pinterest calls", t => {
    let provider = new TikTokProvider(),
        urls = [
            "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22shopping%22%2C%22event_pixel_id%22%3A%226864655820185993221%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:32:31%20GMT-0500%20(Central%20Daylight%20Time",
            "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22form%22%2C%22event_pixel_id%22%3A%226864650693593071621%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)"
        ],
        badUrls = [
            "https://business.topbuzz.com/2/user.js",
            "https://business.topbuzz.com/lib/main.123abc.js",
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
    let url = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22form_detail%22%2C%22event_pixel_id%22%3A%226864650693593071621%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is TikTok");
});

test("TikTokProvider returns data", t => {
    let provider = new TikTokProvider(),
        url = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22form_detail%22%2C%22event_pixel_id%22%3A%226864650693593071621%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)",
        results = provider.parseUrl(url),
        advertiserID = results.data.find((result) => {
            return result.key === "track_data[advertiser_id]";
        }),
        eventType = results.data.find((result) => {
            return result.key === "track_data[event_type]";
        });

    t.is(typeof advertiserID, "object");
    t.is(advertiserID.field, "Advertiser ID");
    t.is(advertiserID.value, "6864693943246782469");

    t.is(typeof eventType, "object");
    t.is(eventType.field, "Event Type");
    t.is(eventType.value, "form_detail");
});
//TODO:
test("TikTokProvider returns requestType", t => {
    let provider = new TikTokProvider(),
        downloadDetailURL = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22download_detail%22%2C%22event_pixel_id%22%3A%226864654174202642437%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:47%20GMT-0500%20(Central%20Daylight%20Time)",
        shoppingURL = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22shopping%22%2C%22event_pixel_id%22%3A%226864655820185993221%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)",
        phoneURL = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22phone%22%2C%22event_pixel_id%22%3A%226864656477248913413%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)",
        downloadDetailParsed = provider.parseUrl(downloadDetailURL),
        shoppingParsed = provider.parseUrl(shoppingURL),
        phoneParsed = provider.parseUrl(phoneURL),
        downloadDetailResult = downloadDetailParsed.data.find((result) => {
            return result.key === "requestType";
        }),
        shoppingResult = shoppingParsed.data.find((result) => {
            return result.key === "requestType";
        }),
        phoneResult = phoneParsed.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof downloadDetailResult, "object");
    t.is(downloadDetailResult.value, "Event");

    t.is(typeof shoppingResult, "object");
    t.is(shoppingResult.value, "Event");

    t.is(typeof phoneResult, "object");
    t.is(phoneResult.value, "Event");
});

test("TikTokProvider handles bad data", t => {
    let provider = new TikTokProvider(),
        url = "https://business.topbuzz.com/2/wap/landing_tetris_log/?device_id=&user_id=&uid=&ut=&client_version=&version_code=&req_id=&cid=&site_id=&ad_id=&track_data=%5B%7B%22event_type%22%3A%22shopping%22%2C%22event_pixel_id%22%3A%226864655820185993221%22%2C%22advertiser_id%22%3A%226864693943246782469%22%2C%22data_type%22%3A2%2C%22options%22%3A%7B%7D%2C%22log_extra%22%3A%22%7B%7D%22%2C%22os%22%3A%22%22%2C%22page_url%22%3A%22https%3A%2F%2Fdigital-intelligence.myshopify.com%2F%22%2C%22page_type%22%3A0%7D%5D&tt_bridge=1111&tt_env=1110&app_id=&source=webunion&sdk_version=s0.0.0.22&t=Wed%20Aug%2026%202020%2023:34:46%20GMT-0500%20(Central%20Daylight%20Time)",
        parsed = provider.parseUrl(url),
        eventData = parsed.data.find((result) => {
            return result.key === "track_data[event_pixel_id]";
        });
    
    t.is(typeof eventData, "object");
    t.is(eventData.value, "6864655820185993221");
});