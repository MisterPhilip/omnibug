import test from 'ava';

import { default as ATInternetProvider } from "./../source/providers/ATInternet.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic AT Internet Provider Information", t => {
    let provider = new ATInternetProvider();
    t.is(provider.key, "ATINTERNET", "Key should always be ATINTERNET");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("Pattern should match valid AT Internet locations", t => {
    let provider = new ATInternetProvider(),
        urls = [
            "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&x19=[0]&ref=https://www.bbc.com/sport/golf/47929783",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns AT Internet", t => {
    let url = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&x19=[0]&ref=https://www.bbc.com/sport/golf/47929783";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ATINTERNET", "Results provider is AT Internet");
});

test("Provider returns data", t => {
    let provider = new ATInternetProvider(),
        url = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&x19=[0]&ref=https://www.bbc.com/sport/golf/47929783";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "ATINTERNET", "Results provider is AT Internet");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("Provider returns custom vars", t => {
    let provider = new ATInternetProvider(),
        url = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&f19=[0]&ref=https://www.bbc.com/sport/golf/47929783";

    let results = provider.parseUrl(url);

    let x2 = results.data.find((result) => {
        return result.key === "x2";
    });

    t.is(typeof x2, "object", "Custom Site 2 exists");
    t.is(x2.field, "Custom Site 2", "Field is Custom Site 2");
    t.is(x2.value, "[responsive]", "Value is correct & decoded");
    t.is(x2.group, "custom");

    let f19 = results.data.find((result) => {
        return result.key === "f19";
    });

    t.is(typeof f19, "object", "Custom Page 19 exists");
    t.is(f19.field, "Custom Page 19", "Field is Custom Page 19");
    t.is(f19.value, "[0]", "Value is correct & decoded");
    t.is(f19.group, "custom");
});

test("AT Internet returns trackingServer", t => {
    let provider = new ATInternetProvider(),
        url = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&x19=[0]&ref=https://www.bbc.com/sport/golf/47929783";

    let results = provider.parseUrl(url),
        trackingServer = results.data.find((result) => {
            return result.key === "trackingServer";
        });

    t.is(typeof trackingServer, "object");
    t.is(trackingServer.field, "Tracking Server");
    t.is(trackingServer.value, "a1.api.bbc.co.uk");
});

test("AT Internet returns requestType", t => {
    let provider = new ATInternetProvider(),
        urlPage = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279117830&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x37&lng=en-US&idp=1458371283113&jv=0&p=golf::sport.golf.story.47929783.page&s2=85&x1=[urn%3Abbc%3Acps%3A1063d611-36b9-a64d-aa78-99f4d378cc62]&x2=[responsive]&x3=[sport-gnl-web]&x4=[en]&x5=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x6=[https%3A%2F%2Fwww.bbc.com%2Fsport%2Fgolf%2F47929783]&x7=[article]&x8=[reverb-0.8.0]&x9=[Tiger%20Woods%3A%20Key%20moments%20in%20the%20Masters%20champion%27s%20life%20and%20career%20-%20BBC%20Sport]&x19=[0]&ref=https://www.bbc.com/sport/golf/47929783",
        urlMedia = "https://a1.api.bbc.co.uk/hit.xiti?s=598308&idclient=48e013ab-4b78-4821-9de0-f9e2fc1b884d&ts=1555279118894&vtag=5.17.1&ptag=js&r=2560x1440x24x24&re=2560x1297&hl=14x58x38&lng=en-US&type=play&type=audio&m6=clip&m1=33&p=Sample%20Audio&p=test::test2::test3&m5=int";

    let resultsPage = provider.parseUrl(urlPage),
        requestTypePage = resultsPage.data.find((result) => {
            return result.key === "requestType";
        }),
        resultsMedia = provider.parseUrl(urlMedia),
        requestTypeMedia = resultsMedia.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof requestTypePage, "object");
    t.is(requestTypePage.value, "Page View");

    t.is(typeof requestTypeMedia, "object");
    t.is(requestTypeMedia.value, "play");
});