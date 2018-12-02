import test from 'ava';

const chrome = require('sinon-chrome/extensions');

import { OmnibugSettings } from "./../source/OmnibugSettings.js";

test.beforeEach(t => {
    chrome.flush();
});

test("OmnibugSettings should return a storage type", t => {
    let settings = new OmnibugSettings();

    t.is(settings.storage_type, "sync");
});

test("OmnibugSettings should return a storage key", t => {
    let settings = new OmnibugSettings();

    t.is(settings.storage_key, "##OMNIBUG_KEY##");
});

test("OmnibugSettings should return a list of defaults", t => {
    let settings = new OmnibugSettings();

    t.is(typeof settings.defaults.defaultPattern, "string");
    t.is(typeof settings.defaults.providers, "object");
    t.is(typeof settings.defaults.highlightKeys, "object");
    t.is(typeof settings.defaults.alwaysExpand, "boolean");
    t.is(typeof settings.defaults.showQuotes, "boolean");
    t.is(typeof settings.defaults.showRedirects, "boolean");
    t.is(typeof settings.defaults.showFullNames, "boolean");
    t.is(typeof settings.defaults.showNavigation, "boolean");
    t.is(typeof settings.defaults.wrapText, "boolean");
    t.is(typeof settings.defaults.showNotes, "boolean");
    t.is(typeof settings.defaults.allowTracking, "boolean");
    t.is(typeof settings.defaults.requestSortOrder, "string");
    t.is(typeof settings.defaults.theme, "string");
    t.is(typeof settings.defaults.color_load, "string");
    t.is(typeof settings.defaults.color_click, "string");
    t.is(typeof settings.defaults.color_quotes, "string");
    t.is(typeof settings.defaults.color_highlight, "string");
    t.is(typeof settings.defaults.color_redirect, "string");
    t.is(typeof settings.defaults.color_hover, "string");
});

test("OmnibugSettings should save defaults if nothing is passed", t => {
    let settings = new OmnibugSettings(),
        savedSettings = settings.save();

    t.deepEqual(savedSettings, settings.defaults);
});

test("OmnibugSettings should save objects", t => {
    let settings = new OmnibugSettings(),
        savedSettings = settings.save({
            "highlightKeys": ["foo", "bar"]
        }),
        finalObject = JSON.parse(JSON.stringify(settings.defaults));
    finalObject.highlightKeys = ["foo", "bar"];

    t.deepEqual(savedSettings, finalObject);
});

test("OmnibugSettings should save a single object", async t => {

    chrome.storage.sync.get.yields({"##OMNIBUG_KEY##": {
        "highlightKeys": ["foo", "bar"],
        "providers": {}
    }});

    let settings = new OmnibugSettings(),
        savedSettings = await settings.updateItem("highlightKeys", ["foo", "bar"]),
        finalObject = JSON.parse(JSON.stringify(settings.defaults));
    finalObject.highlightKeys = ["foo", "bar"];

    t.deepEqual(savedSettings, finalObject);
});

test("OmnibugSettings should restore to defaults", t => {
    let settings = new OmnibugSettings(),
        savedSettings = settings.save({
            "highlightKeys": ["foo", "bar"]
        }),
        newObject = JSON.parse(JSON.stringify(settings.defaults));
    newObject.highlightKeys = ["foo", "bar"];
    t.deepEqual(savedSettings, newObject, "New items should be saved");

    let savedDefaults = settings.restoreDefaults();
    t.deepEqual(savedDefaults, settings.defaults, "Original defaults should be saved");
});

test("OmnibugSettings should load saved changes", async t => {
    let settings = new OmnibugSettings(),
        savedSettings = settings.save({
            "highlightKeys": ["foo", "bar"]
        });
    chrome.storage.sync.get.yields({"##OMNIBUG_KEY##": {
        "highlightKeys": ["foo", "bar"],
        "providers": {}
    }});

    let loadedSettings = await settings.load();
    t.deepEqual(loadedSettings, savedSettings);
});


test("OmnibugSettings should migrate", async t => {
    let settings = new OmnibugSettings();
    chrome.storage.sync.get.yields({"##OMNIBUG_KEY##": {
        "enabledProviders": ["ADOBEANALYTICS"],
            "providers": {}
    }});

    let loadedSettings1 = await settings.migrate();
    t.true(loadedSettings1.providers.ADOBEANALYTICS.enabled);
    t.is(loadedSettings1.migrationIndex, 1);

    chrome.storage.sync.get.yields({"##OMNIBUG_KEY##": {
        "enabledProviders": ["ADOBEANALYTICS"],
        "providers": {},
        "migrationIndex": 1
    }});
    let loadedSettings2 = await settings.migrate();
    t.true(loadedSettings2.providers.ADOBEANALYTICS.enabled);
});