import test from 'ava';

import { default as SimpleAnalyticsProvider } from "./../source/providers/SimpleAnalytics.js";
import { OmnibugProvider } from "./../source/providers.js";

test("SimpleAnalyticsProvider returns provider information", t => {
    let provider = new SimpleAnalyticsProvider();
    t.is(provider.key, "SIMPLEANALYTICS", "Key should always be SIMPLEANALYTICS");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === "object" && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("SimpleAnalyticsProvider pattern should match Simple Analytics calls", t => {
    let provider = new SimpleAnalyticsProvider(),
        urls = [
            "https://queue.simpleanalytics.com/events?hostname=example.com&type=pageview",
            "https://queue.simpleanalyticscdn.com/events?hostname=example.com&event=click",
            "https://queue.simpleanalytics.com/simple.gif?hostname=example.com&url=https%3A%2F%2Fexample.com%2Fpricing",
            "https://queue.simpleanalyticscdn.com/simple.gif?hostname=example.com&type=pageview"
        ],
        negativeUrls = [
            "https://simpleanalytics.com/events?hostname=example.com",
            "https://queue.simpleanalytics.com/other?hostname=example.com",
            "https://queue.simpleanalyticscdn.com/script.js",
            "https://example.com/events?hostname=example.com",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });

    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns SimpleAnalytics", t => {
    let url = "https://queue.simpleanalytics.com/events?hostname=example.com&type=pageview",
        results = OmnibugProvider.parseUrl(url);

    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "SIMPLEANALYTICS", "Results provider is Simple Analytics");
});

test("SimpleAnalyticsProvider returns static data", t => {
    let provider = new SimpleAnalyticsProvider(),
        url = "https://queue.simpleanalytics.com/events?hostname=example.com&url=https%3A%2F%2Fexample.com%2Fpricing&event=signup&ua=Mozilla%2F5.0&unique=true";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "SIMPLEANALYTICS", "Results provider is Simple Analytics");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("SimpleAnalyticsProvider returns custom data - requestType", t => {
    let provider = new SimpleAnalyticsProvider(),
        pageviewUrl = "https://queue.simpleanalyticscdn.com/simple.gif?hostname=example.com&type=pageview",
        customEventUrl = "https://queue.simpleanalytics.com/events?hostname=example.com&event=click",
        pageviewRequest = provider.parseUrl(pageviewUrl),
        customEventRequest = provider.parseUrl(customEventUrl),

        pageviewResult = pageviewRequest.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
        customEventResult = customEventRequest.data.find((result) => {
            return result.key === "omnibug_requestType";
        });

    t.is(typeof pageviewResult, "object");
    t.is(pageviewResult.value, "Page View");

    t.is(typeof customEventResult, "object");
    t.is(customEventResult.value, "Click");
});

test("SimpleAnalyticsProvider returns data from real pageview request", t => {
    let provider = new SimpleAnalyticsProvider(),
        url = "https://queue.simpleanalyticscdn.com/simple.gif?version=cdn_latest_11&hostname=quest.kubefeature.hearstapps.net&https=true&timezone=Europe%2FZurich&path=%2F&language=en-US&screen_width=1920&screen_height=1080&unique=false&type=pageview&metadata=%7B%22contentType%22%3A%22homepage%22%7D",
        results = provider.parseUrl(url),

        hostname = results.data.find((result) => {
            return result.key === "hostname";
        }),
        path = results.data.find((result) => {
            return result.key === "path";
        }),
        timezone = results.data.find((result) => {
            return result.key === "timezone";
        }),
        unique = results.data.find((result) => {
            return result.key === "unique";
        });

    t.is(typeof hostname, "object");
    t.is(hostname.value, "quest.kubefeature.hearstapps.net");

    t.is(typeof path, "object");
    t.is(path.value, "/");

    t.is(typeof timezone, "object");
    t.is(timezone.value, "Europe/Zurich");

    t.is(typeof unique, "object");
    t.is(unique.value, "false");
});

test("SimpleAnalyticsProvider returns request type for real pageview and event requests", t => {
    let provider = new SimpleAnalyticsProvider(),
        pageviewUrl = "https://queue.simpleanalyticscdn.com/simple.gif?version=cdn_latest_11&hostname=quest.kubefeature.hearstapps.net&https=true&timezone=Europe%2FZurich&path=%2F&unique=false&type=pageview&id=aa657636-5ef1-478c-b409-5a4e2221c1fc&metadata=%7B%22contentType%22%3A%22homepage%22%7D&time=1773847501638",
        eventUrl = "https://queue.simpleanalyticscdn.com/simple.gif?version=cdn_latest_11&hostname=quest.kubefeature.hearstapps.net&https=true&timezone=Europe%2FZurich&path=%2F&unique=false&type=event&event=dwell_15&id=5ed37bfa-1cdd-4d89-9d73-f09960aa3435&metadata=%7B%22cst%22%3A%22oi%22%2C%22locale%22%3A%22nl-nl%22%7D&time=1773847516609",
        pageviewRequest = provider.parseUrl(pageviewUrl),
        eventRequest = provider.parseUrl(eventUrl),

        pageviewResult = pageviewRequest.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
        eventResult = eventRequest.data.find((result) => {
            return result.key === "omnibug_requestType";
        });

    t.is(typeof pageviewResult, "object");
    t.is(pageviewResult.value, "Page View");

    t.is(typeof eventResult, "object");
    t.is(eventResult.value, "Dwell_15");
});