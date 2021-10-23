import test from 'ava';

import { default as TealiumEventStreamProvider } from "./../source/providers/TealiumEventStream.js";
import { OmnibugProvider } from "./../source/providers.js";

test("TealiumEventStreamProvider returns provider information", (t) => {
    let provider = new TealiumEventStreamProvider();
    t.is(provider.key, "TEALIUMEVENTSTREAM", "Key should always be TEALIUMEVENTSTREAM");
    t.is(provider.type, "Tag Manager", "Type should always be tagmanager");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("TealiumEventStreamProvider pattern should match Tealium ES calls", t => {
    let provider = new TealiumEventStreamProvider(),
        urls = [
            "https://collect.tealiumiq.com/event",
            "https://collect.tealiumiq.com/event?cacheBuster=1234"
        ],
        badUrls = [
            "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns TealiumEventStream", t => {
    let url = "https://collect.tealiumiq.com/event",
    results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "TEALIUMEVENTSTREAM", "Results provider is TealiumEventStream");
});

test("TealiumEventStreamProvider returns custom data", t => {
    let provider = new TealiumEventStreamProvider(),
        url = "https://tags.tiqcdn.com/utag/omnibug/main/prod/utag.sync.js",
        postData = `{"site_name":"Tealium","site_description":"Customer Data Hub | Customer Data Platform and Tag Management","page_type":"page","post_id":39341,"post_title":"Homepage","post_author":"shawnpeters93","post_date":"2021/07/08","user_role":"guest","meta.viewport":"width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0","meta.format-detection":"telephone=no","meta.robots":"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1","meta.description":"We connect data so you can connect with your customers!","meta.og:locale":"en_US","meta.og:type":"website","meta.og:title":"Customer Data Platform - Tealium","meta.og:description":"We connect data so you can connect with your customers!","meta.og:url":"https://tealium.com/","meta.og:site_name":"Tealium","meta.article:modified_time":"2021-10-21T03:15:44+00:00","meta.og:image":"https://tealium.com/wp-content/uploads/2021/07/featured-image-1200x630-1.jpg","meta.og:image:width":"1200","meta.og:image:height":"630","meta.twitter:card":"summary_large_image","meta.generator":"Jupiter Child Theme 4.0.7.4","dom.referrer":"","dom.title":"Customer Data Platform - Tealium","dom.domain":"tealium.com","dom.query_string":"","dom.hash":"","dom.url":"https://tealium.com/","dom.pathname":"/","dom.viewport_height":1071,"dom.viewport_width":1669,"tealium_event":"view","tealium_visitor_id":"v0000f624c97cd9731054699308bef5ba95b1","tealium_session_id":"1635022078180","tealium_session_number":"2","tealium_session_event_number":"3","tealium_datasource":"","tealium_account":"tealium","tealium_profile":"drj","tealium_environment":"prod","tealium_random":"5aa1b22c428b7b6b2410daf36c3b6c07","tealium_library_name":"utag.js","tealium_library_version":"4.48.0","tealium_timestamp_epoch":1635022100,"tealium_timestamp_utc":"2021-10-23T20:48:20.497Z","tealium_timestamp_local":"2021-10-23T13:48:20.497","js_page.window.optimizely.data.visitor.location.continent":"NA","js_page.window.optimizely.data.visitor.location.region":"AZ","js_page.screen.availWidth":2560,"js_page.screen.availHeight":1400,"js_page.utag.id":"tealium.main","country_code":"US","adwords_conversion_label":"","isTealiumEmployee":false,"timezone_offset":420,"pagename_var":"Customer Data Platform - Tealium","is_mobile":"false","is_tablet":"false","device_type":"desktop","ga_client_id":"504941296.1635021682","cookiebot_id":"a83a1e9a-f607-4568-9f0c-7b758b159a97","_mouse_move":null,"_mouse_key_url":"https://tealium.com/","_mouse_scroll_height":6624,"_mouse_start_time":1635022085135,"_mouse_key_events":["2|3nm-12e-1fl"],"tealium_alt_id":"v0000f624c97cd9731054699308bef5ba95b1","date_updated":"20210511","browser.language":"en-US","browser.languages":["en-US"],"browser.dnt":null,"browser.plugins":"internal-pdf-viewer|internal-pdf-viewer|internal-pdf-viewer|internal-pdf-viewer|internal-pdf-viewer|","browser.screen_width":2560,"browser.screen_height":1440,"browser.screen_depth":24,"browser.tz":"Etc/GMT+7","browser.platform":"Win32","browser.hardware":"32","browser.dom_viewport_height":1071,"browser.dom_viewport_width":1669,"browser.webgl_renderer":"ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9613)","browser.webgl_vendor":"Google Inc. (NVIDIA)","browser.phantom":false,"browser.nightmare":false,"browser.webdriver":false,"browser.selenium":false,"browser.dom_automation":false,"browser.dom_automation_controller":false,"browser.awesomium":false,"browser.spawn":false}`,
        results = provider.parseUrl(url, postData),
        account = results.data.find((result) => {
            return result.key === "omnibug_account";
        }),
        env = results.data.find((result) => {
            return result.key === "tealium_environment";
        }),
        event = results.data.find((result) => {
            return result.key === "tealium_event";
        }),
        browser = results.data.find((result) => {
            return result.key === "browser.nightmare";
        }),
        dom = results.data.find((result) => {
            return result.key === "dom.pathname";
        }),
        js_var = results.data.find((result) => {
            return result.key === "js_page.utag.id";
        }),
        meta = results.data.find((result) => {
            return result.key === "meta.og:site_name";
        }),
        mouse = results.data.find((result) => {
            return result.key === "_mouse_key_url";
        });

    t.is(typeof account, "object");
    t.is(account.value, "tealium / drj");

    t.is(typeof env, "object");
    t.is(env.value, "prod");

    t.is(typeof event, "object");
    t.is(event.value, "view");

    t.is(typeof browser, "object");
    t.is(browser.field, "nightmare");
    t.is(browser.value, "false");
    t.is(browser.group, "browser");

    t.is(typeof dom, "object");
    t.is(dom.field, "pathname");
    t.is(dom.value, "/");
    t.is(dom.group, "dom");

    t.is(typeof js_var, "object");
    t.is(js_var.field, "utag.id");
    t.is(js_var.value, "tealium.main");
    t.is(js_var.group, "js_page");

    t.is(typeof event, "object");
    t.is(meta.field, "og:site_name");
    t.is(meta.value, "Tealium");
    t.is(meta.group, "meta");

    t.is(typeof event, "object");
    t.is(mouse.field, "key_url");
    t.is(mouse.value, "https://tealium.com/");
    t.is(mouse.group, "mouse");
});
