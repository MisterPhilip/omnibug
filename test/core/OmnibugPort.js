import test from 'ava';
import sinon from "sinon";

import { OmnibugPort } from "./../source/OmnibugPort.js";
import { SamplePort } from "./../helpers/SamplePort.js";

test.beforeEach(t => {
    chrome.flush();
});

test("OmnibugPort should return the name", t => {
    let sample = new SamplePort("##OMNIBUG_KEY##-123"),
        port   = new OmnibugPort(sample);

    t.is(port.name, "##OMNIBUG_KEY##-123");
});

test("OmnibugPort should return the ID", t => {
    let sample = new SamplePort("##OMNIBUG_KEY##-123"),
        port   = new OmnibugPort(sample);

    t.is(port.id, "123");
});

test("OmnibugPort should tell if the port is Omnibug or not", t => {
    let samplePass = new SamplePort("##OMNIBUG_KEY##-123"),
        portPass   = new OmnibugPort(samplePass),
        sampleFail = new SamplePort("xyz-456"),
        portFail   = new OmnibugPort(sampleFail);

    t.true(portPass.belongsToOmnibug);
    t.false(portFail.belongsToOmnibug);
});

test("OmnibugPort should return the original browser port", t =>{
    let sample = new SamplePort("##OMNIBUG_KEY##-123"),
        port   = new OmnibugPort(sample);

    t.is(port.port, sample);
});

test("OmnibugPort should initialize and add itself to the tab list", t => {
    let sample1 = new SamplePort("##OMNIBUG_KEY##-123"),
        port1   = new OmnibugPort(sample1),
        sample2 = new SamplePort("##OMNIBUG_KEY##-456"),
        port2   = new OmnibugPort(sample2),
        tabs    = {};

    t.is(Object.keys(tabs).length, 0, "Start with an empty tab list");

    tabs = port1.init(tabs);
    t.is(Object.keys(tabs).length, 1, "There should now be 1 tab in the tabs array");
    t.is(tabs["123"], port1, "port1 should be added to the tabs array");

    tabs = port2.init(tabs);
    t.is(Object.keys(tabs).length, 2, "There should now be 2 tabs in the tabs array");
    t.is(tabs["456"], port2, "port2 should be added to the tabs array");
});

test("OmnibugPort should remove tabs onDisconnect", t => {
    let sample1 = new SamplePort("##OMNIBUG_KEY##-123"),
        port1   = new OmnibugPort(sample1),
        sample2 = new SamplePort("##OMNIBUG_KEY##-456"),
        port2   = new OmnibugPort(sample2),
        tabs;

    tabs = port1.init();
    t.is(Object.keys(tabs).length, 1, "There should now be 1 tab in the tabs array");
    t.is(tabs["123"], port1, "port1 should be added to the tabs array");

    tabs = port2.init(tabs);
    t.is(Object.keys(tabs).length, 2, "There should now be 2 tabs in the tabs array");
    t.is(tabs["456"], port2, "port2 should be added to the tabs array");

    sample2.trigger("disconnect", port2);
    t.is(Object.keys(tabs).length,1, "There should now be 1 tab in the tabs array");
    t.is(tabs["456"], undefined, "port2 should continue to exist in the tabs array");
    t.is(tabs["123"], port1, "port1 should no longer exist in the tabs array");
});

test("OmnibugPort should handle a single setting update", t => {
    let settings = {
        updateItem: () => {}
    };
    let sample1 = new SamplePort("##OMNIBUG_KEY##-123"),
        port1   = new OmnibugPort(sample1, settings),
        mock = sinon.mock(settings).expects("updateItem").once().withExactArgs("settingsKey", "settingsValue");

    port1.init();
    sample1.trigger("message", [{
        type: "settings",
        key: "settingsKey",
        value: "settingsValue"
    }]);
    t.true(mock.verify());
});

test("OmnibugPort should handle settings object update", t => {
    let settings = {
        save: () => {}
    };
    let sample1 = new SamplePort("##OMNIBUG_KEY##-123"),
        port1   = new OmnibugPort(sample1, settings),
        mock = sinon.mock(settings).expects("save").once().withExactArgs({
            key1: "test",
            key2: 1234
        });

    port1.init();
    sample1.trigger("message", [{
        type: "settings",
        value: {
            key1: "test",
            key2: 1234
        }
    }]);
    t.true(mock.verify());
});

test("OmnibugPort should handle a link click event", t => {
    let sample1 = new SamplePort("##OMNIBUG_KEY##-123"),
        port1   = new OmnibugPort(sample1);

    port1.init();
    sample1.trigger("message", [{
        type: "linkClick",
        url: "https://omnibug.io/"
    }]);
    t.true(chrome.tabs.create.withArgs({url: "https://omnibug.io/"}).calledOnce);
});