import test from 'ava';

import { default as WebEngageProvider } from "./../source/providers/WebEngage.js";
import { OmnibugProvider } from "./../source/providers.js";

// Payloads generated with WebEngage's own transit + LZ-string encoder (webengage-min-v-6.0.js)
const singleEvent = `{"data":"NobwRANglgxgpgOwM5wPowPYBM5gFxhQIB+xATAAxkAsMArAIYCcYANGEgK5Rb5gCMWMnADMAM2oMAtHQBGANhhtI3XgQAcsgOwx5WOnCnUxIhspiq+nFACdU/MiOVIAnkgAucALaosDd2Z44EhYANaoPPgi7AAODADmaJw2EHwAFu7uMUh4APS5AO5FAHQFDAg4NhgIxUS5ynGJqO5Q7hC4BADq5ZUA8ghgAL7sAB6oNnAAjpxwHhFqYJo6egZGJtJEpJQ09MxS/FpM/NTq1FoUTBRXUhTm/nDxGDYufAwxMdAw/lDVynAAboh3KgEAwvB0wJgEAg4DB3AACBAYArwmCfUJwXjsAFA3z+QLBWEtX4ENJwKrKJGePikFoQHDmVovAiACkhABCQ8MAZJCAfkhAEyQgFlIXmAAUghtjAQhgS1wTT3Nt5PsKDctAAVK54CjqPBkJjFK4UABaQwAukAA"}`,
    batchEvents = `{"data":"NobwRANglgxgpgOwM5wPowPYBM5gFxhQIB+xATAAxkAsMArAIYCcYANGEgK5Rb5gCMWMnADMAM2oMAtHQBGANhhtI3XgQAcsgOwx5WOnCnUxIhspiq+nFACdU/MiOVIAnkgAucALaosDd2Z44EhYANaoPPgi7AAODADmaJw2EHwAFu7uMUh4APS5AO5FAHQFDAg4NhgIxUS5ynGJqO5Q7hC4BADq5ZUA8ghgAL7sAB6oNnAAjpxwHhFqYJo6egZGJtJEpJQ09MxS/FpM/NTq1FoUTBRXUhTm/nDxGDYufK4e3spwAG6I7qgIDC8HTAXygSFaT3+cAKqBQSHB1U+PwQfz8AXwIGGYG+v2aUCBfGI7m28n2FBuWgAKlc8BR1HhKMUrhQAFpDVjgaDwZBoTA4PibchUWiMFjsLiRAiCYTiSQyBRKdgQSwabS6fSGYymcwqsDWOB2BxOcVuTw+NGBYJheZRWIJJIpdKZbJ5QolMoVA3VWoIep2potNrA7qemz9dlgMYTaazP6SxZqlaa9ZSQXbEV7A5HE5nC7Mm53TyPZ58BgxGJc/xQRHsHEo/6A4GYBAIOAwdwAAgQGAKHZgXNCcF4teRqP8lo4bZaiIIaS9ym7nkJRKgEH57BgrReBEAFJCACEgO4AySEA/JCAJkhALKQp8AApARut/FoEghEklkinUii0+lkJhMq5swYALpAAA=="}`;

test("WebEngageProvider returns provider information", (t) => {
    let provider = new WebEngageProvider();
    t.is(provider.key, "WEBENGAGE", "Key should always be WEBENGAGE");
    t.is(provider.type, "Customer Engagement", "Type should always be customer");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("WebEngageProvider pattern should match WebEngage calls", t => {
    let provider = new WebEngageProvider(),
        urls = [
            "https://c.in.webengage.com/l4.jpg",
            "https://c.webengage.com/l4.jpg",
            "https://c.in.webengage.com/l3.jpg",
            "http://c.ksa.webengage.com/l4.jpg"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), url);
    });

    t.false(provider.checkUrl("https://c.in.webengage.com/upf2.js?upfc=abc"), "Provider should not match on profile fetches");
    t.false(provider.checkUrl("https://widgets.in.webengage.com/js/webengage-min-v-6.0.js"), "Provider should not match on the SDK");
    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns WebEngage", t => {
    let url = "https://c.in.webengage.com/l4.jpg";
    let results = OmnibugProvider.parseUrl(url, singleEvent);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "WEBENGAGE", "Results provider is WebEngage");
});

test("WebEngageProvider decodes a single event", t => {
    let provider = new WebEngageProvider(),
        results = provider.parseUrl("https://c.in.webengage.com/l4.jpg", singleEvent),
        find = (key) => results.data.find((result) => result.key === key);

    t.is(find("requestTypeParsed").value, "connect now clicked");
    t.is(find("omnibug_account").value, "in~~2024c5a9");
    t.true(find("omnibug_account").hidden);
    t.is(find("license_code").field, "License Code");

    t.is(find("event_name").field, "Event Name");
    t.is(find("event_name").group, "general");
    t.is(find("category").value, "application");
    t.is(find("event_time").value, "2026-10-07T00:08:29.000Z", "Transit dates are decoded");
    t.is(find("cuid").group, "user");

    t.is(find("event_data.section").value, "hero");
    t.is(find("event_data.section").field, "section");
    t.is(find("event_data.section").group, "event");
    t.is(find("event_data.note").value, "~tilde", "Escaped tildes are decoded");
    t.is(find("event_data.city").value, "नई दिल्ली", "Unicode survives decompression");

    t.is(find("system_data.page_url").value, "https://www.wanderon.in/");
    t.is(find("system_data.page_url").group, "system");
});

test("WebEngageProvider decodes batched events", t => {
    let provider = new WebEngageProvider(),
        results = provider.parseUrl("https://c.in.webengage.com/l4.jpg", batchEvents),
        find = (key) => results.data.find((result) => result.key === key);

    t.is(find("requestTypeParsed").value, "(2) visitor_new_session, connect now clicked");
    t.is(find("omnibug_account").value, "in~~2024c5a9");
    t.is(find("[1].event_data.section").field, "[1].section");
    t.is(find("[1].event_data.section").group, "event");
    t.is(find("[0].category").value, "system");
});

test("WebEngageProvider decodes form data from the XHR fallback", t => {
    let provider = new WebEngageProvider(),
        results = provider.parseUrl("https://c.in.webengage.com/l3.jpg", {"data": [JSON.parse(singleEvent).data]}),
        type = results.data.find((result) => result.key === "requestTypeParsed");

    t.is(type.value, "connect now clicked");
});

test("WebEngageProvider has columnMappings", t => {
    let provider = new WebEngageProvider();
    t.deepEqual(provider.columnMapping, {"account": "omnibug_account", "requestType": "requestTypeParsed"});
});
