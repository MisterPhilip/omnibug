import test from 'ava';

const chrome = require('sinon-chrome/extensions');

import { OmnibugTracker } from "./../source/OmnibugTracker.js";

test.beforeEach(t => {
    chrome.flush();
});

test.todo("OmnibugTracker should create a tracker object in the window scope");
test.todo("OmnibugTracker should load GA core code once on page");
test.todo("OmnibugTracker should respect user's allowTracking settings");
test.todo("OmnibugTracker should track data");