import test from 'ava';

import { default as LyticsProvider } from "../source/providers/Lytics";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "LYTICS";

test("LyticsProvider returns provider information", (t) => {
    let provider = new LyticsProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be Lytics");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("LyticsProvider pattern should match Lytics calls", t => {
    let provider = new LyticsProvider(),
        urls = [
            "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?pf-widget-id=gdpr-consent&pf-widget-type=message&pf-widget-layout=slideout&pf-widget-variant=1&pf-widget-event=show&_ts=1589047241346&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_e=pv&_sesstart=1&_tz=-4&_ul=en-US&_sz=1920x1200&_ca=jstag1",
            "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?userid=1234&facebook_id=abc123&twitter_id=def123&linkedin_id=hij123&email=jon%40castleblack.com&name=Jon%20Snow&first_name=Jon&last_name=Snow&title=King%20in%20the%20North&company=House%20Stark&phone=555-555-5555&cell=555-555-5555&age=21&gender=m&city=Winterfell&state=Westeros&country=IE&zip=55555&origin=organic&status=known&_ts=1589047725127&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
            "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?_e=pv&_tz=-4&_ul=en-US&_sz=1920x1200&_ts=1589047923087&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
            "https://c.lytics.io/c/07fff5da924b3993e5b668467ac1d2d5?OnetrustActiveGroups=%2C0_37820%2C1%2C0_37809%2C2%2C0_37810%2C3%2C0_37811%2C4%2C0_37812%2C0_37813%2C0_37814%2C0_37815%2C0_37818%2C0_37819%2C0_37822%2C0_37823%2C0_37821%2C0_37816%2C0_37817%2C0_87228%2C0_87229%2C0_87227%2C&_ts=1589048050835&_nmob=t&_device=desktop&url=www.regit.cars%2F&_v=3.0.3&_uid=u_670591093815502600&_getid=t"
        ],
        badUrls = [
            "https://snap.licdn.com/li.lms-analytics/insight.min.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Lytics", t => {
    let url = "https://c.lytics.io/c/5a4ace928f7786173d963ced2784797f?ga_cid=1117987689.1589047241&_ts=1589047242522&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Lytics");
});

test("LyticsProvider returns client ID", t => {
    let provider = new LyticsProvider(),
        url = "https://c.lytics.io/c/5a4ace928f7786173d963ced2784797f?ga_cid=1117987689.1589047241&_ts=1589047242522&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        results = provider.parseUrl(url),
        cid = results.data.find((result) => {
            return result.key === "cid";
        });

    t.is(typeof cid, "object");
    t.is(cid.field, "Account ID (cid)");
    t.is(cid.value, "5a4ace928f7786173d963ced2784797f");

});

test("LyticsProvider returns data", t => {
    let provider = new LyticsProvider(),
        url = "https://c.lytics.io/c/5a4ace928f7786173d963ced2784797f?ga_cid=1117987689.1589047241&_ts=1589047242522&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        results = provider.parseUrl(url),
        ts = results.data.find((result) => {
        	return result.key === "_ts";
        });

    t.is(typeof ts, "object");
    t.is(ts.field, "Timestamp (_ts)");
    t.is(ts.value, "1589047242522");

});

test("LyticsProvider returns custom events", t => {
    let provider = new LyticsProvider(),
        pvUrl = "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?_e=pv&_tz=-4&_ul=en-US&_sz=1920x1200&_ts=1589047923087&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        pvResults = provider.parseUrl(pvUrl),
        customPvEvent = pvResults.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        convUrl = "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?event=conversion&campaign_id=someconversionid&variation_id=somevariationid&currency=USD&value=25.99&_ts=1589147594430&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        convResults = provider.parseUrl(convUrl),
        customConvEvent = convResults.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        otherEventUrl = "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?event=someEvent&campaign_id=someconversionid&variation_id=somevariationid&currency=USD&value=25.99&_ts=1589147594430&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        otherEventResults = provider.parseUrl(otherEventUrl),
        customOtherEvent = otherEventResults.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        noEventUrl = "https://c.lytics.io/c/00ed91c03664aaf1ea539a87d4c560e7?campaign_id=someconversionid&variation_id=somevariationid&currency=USD&value=25.99&_ts=1589147594430&_nmob=t&_device=desktop&url=www.lytics.com%2F&_uid=91684.5253390131&_v=2.0.0&_ca=jstag1",
        noEventResults = provider.parseUrl(noEventUrl),
        customNoEvent = noEventResults.data.find((result) => {
            return result.key === "requestTypeParsed";
        }); 


    t.is(typeof customPvEvent, "object");
    t.is(customPvEvent.field, "Request Type");
    t.is(customPvEvent.value, "Page View");

    t.is(typeof customConvEvent, "object");
    t.is(customConvEvent.field, "Request Type");
    t.is(customConvEvent.value, "Conversion");

    t.is(typeof customOtherEvent, "object");
    t.is(customOtherEvent.field, "Request Type");
    t.is(customOtherEvent.value, "someEvent");

    t.is(typeof customNoEvent, "object");
    t.is(customNoEvent.field, "Request Type");
    t.is(customNoEvent.value, "Other");



});