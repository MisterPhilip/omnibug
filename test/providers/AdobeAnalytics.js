import test from 'ava';

import { OmnibugProvider, AdobeAnalyticsProvider } from "./../providers.js";

test("Generic AA Provider Information", t => {
    let provider = new AdobeAnalyticsProvider();
    t.is(provider.key, "ADOBEANALYTICS", "Key should always be ADOBEANALYTICS");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("Pattern should match various AA domains", t => {
    let provider = new AdobeAnalyticsProvider(),
        urls = [
            "https://smetrics.omnibug.io/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?",
            "http://metrics.omnibug.io/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?",
            "http://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?",
            "http://omnibug.d2.sc2.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?",
            "http://omnibug.sc.2o7.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns AdobeAnalytics", t => {
    let url = "https://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?AQB=1&ndh=1&pf=1&t=9%2F0%2F2018%2016%3A16%3A47%202%20420&D=D%3D&mid=27914645550662449863676805716141562873&aamlh=9&ce=UTF-8&ns=omnibug&pageName=omnibug%3Ahome&g=https%3A%2F%2Fomnibug.io%2F&server=omnibug.io&aamb=XXXpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&h1=omnibug%2Chome&v3=omnibug%3Ahome&v5=%2B1&c14=guest&v14=guest&c20=tuesday%7C6%3A00pm&v20=D%3Dc20&c50=glo%3A2017.04.25&v90=27914645550662449863676805716141562873&s=2560x1440&c=24&j=1.6&v=N&k=Y&bw=2560&bh=1309&mcorgid=1ECE43625269ABXXXXXXXXXX%40AdobeOrg&AQE=1";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEANALYTICS", "Results provider is Adobe Analytics");
});

test("Provider returns data", t => {
    let provider = new AdobeAnalyticsProvider(),
        url = "https://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?AQB=1&ndh=1&pf=1&t=9%2F0%2F2018%2016%3A16%3A47%202%20420&D=D%3D&mid=27914645550662449863676805716141562873&aamlh=9&ce=UTF-8&ns=omnibug&pageName=omnibug%3Ahome&g=https%3A%2F%2Fomnibug.io%2F&server=omnibug.io&aamb=XXXpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&h1=omnibug%2Chome&v3=omnibug%3Ahome&v5=%2B1&c14=guest&v14=guest&c20=tuesday%7C6%3A00pm&v20=D%3Dc20&c50=glo%3A2017.04.25&v90=27914645550662449863676805716141562873&s=2560x1440&c=24&j=1.6&v=N&k=Y&bw=2560&bh=1309&mcorgid=1ECE43625269ABXXXXXXXXXX%40AdobeOrg&AQE=1";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "ADOBEANALYTICS", "Results provider is Adobe Analytics");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("Provider returns props/eVars", t => {
    let provider = new AdobeAnalyticsProvider(),
        url = "https://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?AQB=1&ndh=1&pf=1&t=9%2F0%2F2018%2016%3A16%3A47%202%20420&D=D%3D&mid=27914645550662449863676805716141562873&aamlh=9&ce=UTF-8&ns=omnibug&pageName=omnibug%3Ahome&g=https%3A%2F%2Fomnibug.io%2F&server=omnibug.io&aamb=XXXpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&h1=omnibug%2Chome&v3=omnibug%3Ahome&v5=%2B1&c14=guest&v14=guest&c20=tuesday%7C6%3A00pm&v20=D%3Dc20&c50=glo%3A2017.04.25&v90=27914645550662449863676805716141562873&s=2560x1440&c=24&j=1.6&v=N&k=Y&bw=2560&bh=1309&mcorgid=1ECE43625269ABXXXXXXXXXX%40AdobeOrg&AQE=1";

    let results = provider.parseUrl(url);

    let prop14 = results.data.find((result) => {
        return result.key === "c14";
    });

    t.is(typeof prop14, "object", "Prop14 exists");
    t.is(prop14.field, "prop14", "Field is prop14");
    t.is(prop14.value, "guest", "Value is correct & decoded");
    t.is(prop14.group, "props");

    let eVar3 = results.data.find((result) => {
        return result.key === "v3";
    });

    t.is(typeof eVar3, "object", "eVar3 exists");
    t.is(eVar3.field, "eVar3", "Field is prop14");
    t.is(eVar3.value, "omnibug:home", "Value is correct & decoded");
    t.is(eVar3.group, "eVars");
});

test("Provider returns rsid", t => {
    let provider = new AdobeAnalyticsProvider(),
        url = "https://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131?AQB=1&ndh=1&pf=1&t=9%2F0%2F2018%2016%3A16%3A47%202%20420&D=D%3D&mid=27914645550662449863676805716141562873&aamlh=9&ce=UTF-8&ns=omnibug&pageName=omnibug%3Ahome&g=https%3A%2F%2Fomnibug.io%2F&server=omnibug.io&aamb=XXXpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&h1=omnibug%2Chome&v3=omnibug%3Ahome&v5=%2B1&c14=guest&v14=guest&c20=tuesday%7C6%3A00pm&v20=D%3Dc20&c50=glo%3A2017.04.25&v90=27914645550662449863676805716141562873&s=2560x1440&c=24&j=1.6&v=N&k=Y&bw=2560&bh=1309&mcorgid=1ECE43625269ABXXXXXXXXXX%40AdobeOrg&AQE=1";

    let results = provider.parseUrl(url),
        rsid = results.data.find((result) => {
            return result.key === "rsid";
        });

    t.is(typeof rsid, "object", "RSID exists");
    t.is(rsid.field, "Report Suites", "Field is Report Suites");
    t.is(rsid.value, "omnibug-test", "Value is correct & decoded");
});

test("Provider returns POST data", t => {
    let provider = new AdobeAnalyticsProvider(),
        url = "https://omnibug.d1.sc.omtrdc.net/b/ss/omnibug-test/1/JS-2.1.0-D7QN/s78921068678131",
        postData = "AQB=1&ndh=1&pf=1&t=9%2F0%2F2018%2016%3A16%3A47%202%20420&D=D%3D&mid=27914645550662449863676805716141562873&aamlh=9&ce=UTF-8&ns=omnibug&pageName=omnibug%3Ahome&g=https%3A%2F%2Fomnibug.io%2F&server=omnibug.io&aamb=XXXpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&h1=omnibug%2Chome&v3=omnibug%3Ahome&v5=%2B1&c14=guest&v14=guest&c20=tuesday%7C6%3A00pm&v20=D%3Dc20&c50=glo%3A2017.04.25&v90=27914645550662449863676805716141562873&s=2560x1440&c=24&j=1.6&v=N&k=Y&bw=2560&bh=1309&mcorgid=1ECE43625269ABXXXXXXXXXX%40AdobeOrg&AQE=1";

    let results = provider.parseUrl(url, postData);


    let pageName = results.data.find((result) => {
        return result.key === "pageName";
    });

    t.is(typeof pageName, "object", "pageName exists");
    t.is(pageName.field, "Page name", "Field is Page name");
    t.is(pageName.value, "omnibug:home", "Value is decoded to omnibug:home");
    t.is(pageName.group, "general");
});


test.todo("Provider returns Activity Map");
test.todo("Provider returns Context Data");