import test from "ava";
import { default as PulsebyAIProvider } from "./../source/providers/PulsebyAI.js";
import { OmnibugProvider } from "./../source/providers.js";

const PROVIDER = new PulsebyAIProvider();

test("Provider key is correct", t => {
    t.is(PROVIDER.key, "PULSEBYAI");
});

test("Provider name is correct", t => {
    t.is(PROVIDER.name, "Pulse by AI");
});

test("Provider type is analytics", t => {
    t.is(PROVIDER.type, "Analytics");
});

test("Matches /track endpoint", t => {
    t.true(PROVIDER.checkUrl("https://pulse.analyticsintelligence.net/track"));
});

test("Matches /track/batch endpoint", t => {
    t.true(PROVIDER.checkUrl("https://pulse.analyticsintelligence.net/track/batch"));
});

test("Matches /track/flush endpoint", t => {
    t.true(PROVIDER.checkUrl("https://pulse.analyticsintelligence.net/track/flush"));
});

test("Matches /session/end endpoint", t => {
    t.true(PROVIDER.checkUrl("https://pulse.analyticsintelligence.net/session/end"));
});

test("Matches /campaign/track endpoint", t => {
    t.true(PROVIDER.checkUrl("https://pulse.analyticsintelligence.net/campaign/track"));
});

test("Does NOT match unrelated URLs", t => {
    t.false(PROVIDER.checkUrl("https://example.com/track"));
    t.false(PROVIDER.checkUrl("https://google.com"));
});

test("columnMapping account key is company_id", t => {
    t.is(PROVIDER.columnMapping.account, "company_id");
});

test("columnMapping requestType key is event_type", t => {
    t.is(PROVIDER.columnMapping.requestType, "event_type");
});

test("Has all required groups", t => {
    const keys = PROVIDER.groups.map(g => g.key);
    t.true(keys.includes("general"));
    t.true(keys.includes("identity"));
    t.true(keys.includes("page"));
    t.true(keys.includes("campaign"));
    t.true(keys.includes("batch"));
    t.true(keys.includes("geo"));
});

test("Handles empty POST body gracefully", t => {
    t.notThrows(() => {
        PROVIDER.parseUrl("https://pulse.analyticsintelligence.net/track", "");
    });
});

test("Handles invalid JSON body gracefully", t => {
    t.notThrows(() => {
        PROVIDER.parseUrl("https://pulse.analyticsintelligence.net/track", "not-json");
    });
});

test("Parses single event fields correctly", t => {
    const payload = JSON.stringify({
        event_type: "click",
        company_id: "698a159f215e0925a14b6a99",
        user_id: "1739372120000-abc123",
        device_id: "1739372120000-xyz789",
        session_id: "1739372120000-session01",
        page_url: "https://powerdby.ai/",
        timestamp: "2026-02-12T14:55:20.320Z"
    });
    const result = PROVIDER.parseUrl("https://pulse.analyticsintelligence.net/track", payload);
    const eventType = result.data.find(p => p.key === "event_type");
    t.is(eventType.value, "click");
});

test("Parses batch and returns array of results", t => {
    const payload = JSON.stringify({
        events: [
            { event_type: "pageview", company_id: "698a159f215e0925a14b6a99", user_id: "abc", device_id: "xyz", session_id: "sess1", page_url: "https://powerdby.ai/", timestamp: "2026-02-12T14:55:20.320Z" },
            { event_type: "click", company_id: "698a159f215e0925a14b6a99", user_id: "abc", device_id: "xyz", session_id: "sess1", page_url: "https://powerdby.ai/", timestamp: "2026-02-12T14:55:21.000Z" }
        ]
    });
    const result = PROVIDER.parseUrl("https://pulse.analyticsintelligence.net/track/batch", payload);
    t.true(Array.isArray(result));
    t.is(result.length, 2);
    t.is(result[0].data.find(p => p.key === "event_type").value, "pageview");
    t.is(result[1].data.find(p => p.key === "event_type").value, "click");
});
