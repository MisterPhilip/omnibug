import test from 'ava';

import { default as MparticleProvider } from "./../source/providers/Mparticle.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Mparticle Provider Information", t => {
    let provider = new MparticleProvider();
    t.is(provider.key, "MPARTICLE", "Key should always be MPARTICLE");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("Pattern should match Mparticle event requests", t => {
    let provider = new MparticleProvider(),
        urls = [
            "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events",
            "https://jssdks.mparticle.com/v2/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns MparticleProvider", t => {
    let url = "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events";
    
    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "MPARTICLE", "Results provider is Mparticle");
});

test("Provider returns client ID code", t => {
    let provider = new MparticleProvider(),
        url = "https://jssdks.mparticle.com/v1/JS/clientcodehere/Events";

    let results = provider.parseUrl(url),
        clientCode = results.data.find((result) => {
            return result.key === "clientCode";
        });

    t.is(typeof clientCode, "object", "clientCode exists");
    t.is(clientCode.field, "Client Code", "Field is Client Code");
    t.is(clientCode.value, "clientcodehere", "Client Code value is correct");
});

test("Provider returns post data", t => {
    let provider = new MparticleProvider(),
        url = "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events",
        postData = '{"n":"pageView","ua":{},"str":{"uid":{"Expires":"2028-10-27T14:46:21.1929245Z","Value":"g=000000000-0000-0000-0000-c17f9f84faa0&u=000000000000000&cr=00000000"}},"attrs":null,"sdk":"1.16.2","sid":"00000000-0000-0000-0000-1B0265340D22","dt":10,"dbg":true,"ct":0,"o":null,"eec":0,"av":null,"cgid":"00000000-0000-0000-0000-24c7e879e4b7","das":"00000000-0000-0000-0000-c17f9f84faa0","uic":false,"fr":false,"iu":false,"at":1,"lr":"https://www.example.com/","pb":{}}';

    let results = provider.parseUrl(url, postData);

    let n = results.data.find((result) => {
            return result.key === "n";
        }),
        sid = results.data.find((result) => {
            return result.key === "sid";
        }),
        sdk = results.data.find((result) => {
            return result.key === "sdk";
        });

    // Event Type (n)   
    t.is(typeof n, "object", "n parameter exists");
    t.is(n.field, "Event Name (n)", "Field is Event Name (n)");
    t.is(n.value, "pageView", "Actual value is pageView");
    t.is(n.group, "general");

    // Session UID (sid)
    t.is(typeof sid, "object", "sid parameter exists");
    t.is(sid.field, "Session UID (sid)", "Field is Session UID (sid)");
    t.is(sid.value, "00000000-0000-0000-0000-1B0265340D22", "Actual value is 00000000-0000-0000-0000-1B0265340D22");
    t.is(sid.group, "general");

    // SDK Verison (sdk)
    t.is(typeof sdk, "object", "sdk parameter exists");
    t.is(sdk.field, "SDK Version (sdk)", "Field is SDK Version (sdk)");
    t.is(sdk.value, "1.16.2", "SDK value is 1.16.2");
    t.is(sdk.group, "general");

});

test("Provider returns custom event types", t => {
    let provider = new MparticleProvider(),
        url = "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events",
        postData_pageview = '{"n":"pageView"}',
        postData_sessionStart = '{"n":"1"}',
        postData_sessionEnd = '{"n":"2"}',
        postData_stateTransition = '{"n":"10"}';

    let results_pageview = provider.parseUrl(url, postData_pageview),
        results_sessionStart = provider.parseUrl(url, postData_sessionStart),
        results_sessionEnd = provider.parseUrl(url, postData_sessionEnd),
        results_stateTransition = provider.parseUrl(url, postData_stateTransition);

    let pv = results_pageview.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        ss = results_sessionStart.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        se = results_sessionEnd.data.find((result) => {
            return result.key === "requestTypeParsed";
        }),
        st = results_stateTransition.data.find((result) => {
            return result.key === "requestTypeParsed";
        });

    t.is(typeof pv, "object", "pv data is an object");
    t.is(pv.field, "Event Type", "Field is Event Type");
    t.is(pv.value, "Page View", "Event Type has been parsed to Page View");
    t.is(pv.group, "general");
    
    t.is(typeof ss, "object", "ss data is an object");
    t.is(ss.field, "Event Type", "Field is Event Type");
    t.is(ss.value, "Session Start", "Event Type has been parsed to Session Start");
    t.is(ss.group, "general");  

    t.is(typeof se, "object", "se data is an object");
    t.is(se.field, "Event Type", "Field is Event Type");
    t.is(se.value, "Session End", "Event Type has been parsed to Session End");
    t.is(se.group, "general");

    t.is(typeof st, "object", "st data is an object");
    t.is(st.field, "Event Type", "Field is Event Type");
    t.is(st.value, "State Transition", "Event Type has been parsed to State Transition");
    t.is(st.group, "general");

});

test("Provider returns custom attribute data", t => {
    let provider = new MparticleProvider(),
        url = "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events",
        postData = '{"n":"pageView","et":0,"ua":{},"str":{"uid":{"Expires":"2028-10-27T14:46:21.1929245Z","Value":"g=0000000-0000-0000-0000-000000000&u=5750111232213572680&cr=00000000"}},"attrs":{"channel":"home","device":"Desktop","domain":"www.example.com","env":"production","ga":"GA1.2.12345678.12345678","gid":"GA1.2.123456789.12345678","hash":"","host":"www.example.com","mcvid":"123456789","metricsid":"ABCD123456789","pagename":"home","pathname":"/","querystring":"","url":"https://www.example.com/","userAgent":"Mozilla/5.0"},"sdk":"1.16.2","sid":"3D3E8F3E-CD2C-434C-B1CB-0AD8111D5328","dt":3,"dbg":true,"ct":1,"o":null,"eec":0,"av":null,"cgid":"c64af3a7-0000-0000-0000-00000000","das":"00000000-0000-0000-0000-0000000000","uic":false,"flags":{},"pb":{}}';

    let results = provider.parseUrl(url, postData); 

    let channel = results.data.find((result) => {
            return result.key === "attrs.channel";
        }),
        device = results.data.find((result) => {
            return result.key === "attrs.device";
        }),
        domain = results.data.find((result) => {
            return result.key === "attrs.domain";
        });

    t.is(typeof channel, "object", "channel data is an object");
    t.is(channel.field, "channel", "channel is field value, attrs has been stripped");
    t.is(channel.value, "home", "channel value is home");
    t.is(channel.group, "customattributes");

    t.is(typeof device, "object", "device data is an object");
    t.is(device.field, "device", "device is field value, attrs has been stripped");
    t.is(device.value, "Desktop", "device value is Desktop");
    t.is(device.group, "customattributes");

    t.is(typeof domain, "object", "domain data is an object");
    t.is(domain.field, "domain", "domain is field value, attrs has been stripped");
    t.is(domain.value, "www.example.com", "domain value is www.example.com");
    t.is(domain.group, "customattributes");

});

test("Provider 'Other' column is empty", t => {
    let provider = new MparticleProvider(),
        url = "https://jssdks.mparticle.com/v1/JS/clientcodeherexxxxxxxxxxxxxxxxxx/Events",
        postData = '{"n":"pageView","et":0,"ua":{},"str":{"uid":{"Expires":"2028-10-27T14:46:21.1929245Z","Value":"g=0000000-0000-0000-0000-000000000&u=5750111232213572680&cr=00000000"}},"attrs":{"channel":"home","device":"Desktop","domain":"www.example.com","env":"production","ga":"GA1.2.12345678.12345678","gid":"GA1.2.123456789.12345678","hash":"","host":"www.example.com","mcvid":"123456789","metricsid":"ABCD123456789","pagename":"home","pathname":"/","querystring":"","url":"https://www.example.com/","userAgent":"Mozilla/5.0"},"sdk":"1.16.2","sid":"3D3E8F3E-CD2C-434C-B1CB-0AD8111D5328","dt":3,"dbg":true,"ct":1,"o":null,"eec":0,"av":null,"cgid":"c64af3a7-0000-0000-0000-00000000","das":"00000000-0000-0000-0000-0000000000","uic":false,"flags":{},"pb":{}}';

    let results = provider.parseUrl(url, postData); 

    let other = results.data.find((result) => {
            return result.group === "other";
        });

    t.is(typeof other, 'undefined', "other variable is an undefined");

});