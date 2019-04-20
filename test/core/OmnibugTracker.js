import test from 'ava';
import sinon from "sinon";

import { OmnibugTracker } from "./../source/OmnibugTracker.js";

test.beforeEach(t => {
    chrome.flush();
});

test("OmnibugTracker should create a tracker object in the window scope", t => {
    let tracker = new OmnibugTracker;
    t.is(typeof window.tracker, "function");
});

test("OmnibugTracker should add initial data to the tracker object", t => {
    let tracker = new OmnibugTracker;
    t.is(window.tracker.q.length, 4);
    t.is(window.tracker.q[0][0], "create");
    t.is(window.tracker.q[1][0], "set");
    t.is(window.tracker.q[1][1], "checkProtocolTask");
    t.is(window.tracker.q[2][0], "set");
    t.is(window.tracker.q[2][1], "forceSSL");
    t.is(window.tracker.q[3][0], "set");
    t.is(window.tracker.q[3][1], "dimension1");
});

test("OmnibugTracker.browserTrackingEnabled should return true", t => {
    t.true(OmnibugTracker.browserTrackingEnabled);
});

test.todo("OmnibugTracker should load GA core code once on page");
test.todo("OmnibugTracker should respect user's allowTracking settings");
test.todo("OmnibugTracker should track data");