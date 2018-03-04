import test from 'ava';

import { OmnibugPort } from "./../OmnibugPort.js";
import { SamplePort } from "./../polyfills.js";

test("OmnibugPort should return the name", t => {
    let sample = new SamplePort("omnibug-123"),
        port   = new OmnibugPort(sample);

    t.is(port.name, "omnibug-123");
});

test("OmnibugPort should return the ID", t => {
    let sample = new SamplePort("omnibug-123"),
        port   = new OmnibugPort(sample);

    t.is(port.id, "123");
});

test("OmnibugPort should tell if the port is Omnibug or not", t => {
    let samplePass = new SamplePort("omnibug-123"),
        portPass   = new OmnibugPort(samplePass),
        sampleFail = new SamplePort("xyz-456"),
        portFail   = new OmnibugPort(sampleFail);

    t.true(portPass.belongsToOmnibug);
    t.false(portFail.belongsToOmnibug);
});

test("OmnibugPort should return the original browser port", t =>{
    let sample = new SamplePort("omnibug-123"),
        port   = new OmnibugPort(sample);

    t.is(port.port, sample);
});

test("OmnibugPort should initialize and add itself to the tab list", t => {
    let sample1 = new SamplePort("omnibug-123"),
        port1   = new OmnibugPort(sample1),
        sample2 = new SamplePort("omnibug-456"),
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
    let sample1 = new SamplePort("omnibug-123"),
        port1   = new OmnibugPort(sample1),
        sample2 = new SamplePort("omnibug-456"),
        port2   = new OmnibugPort(sample2),
        tabs    = [];

    t.is(Object.keys(tabs).length, 0, "Start with an empty tab list");

    tabs = port1.init(tabs);
    t.is(Object.keys(tabs).length, 1, "There should now be 1 tab in the tabs array");
    t.is(tabs["123"], port1, "port1 should be added to the tabs array");

    tabs = port2.init(tabs);
    t.is(Object.keys(tabs).length, 2, "There should now be 2 tabs in the tabs array");
    t.is(tabs["456"], port2, "port2 should be added to the tabs array");

    sample1.trigger("onDisconnect", port1);
    t.is(Object.keys(tabs).length,1, "There should now be 1 tab in the tabs array");
    t.is(tabs["456"], port2, "port2 should continue to exist in the tabs array");
    t.is(tabs["123"], undefined, "port1 should no longer exist in the tabs array");
});