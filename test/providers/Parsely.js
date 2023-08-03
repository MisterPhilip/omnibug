import test from 'ava';

import { default as ParselyProvider } from "./../source/providers/Parsely.js";
import { OmnibugProvider } from "./../source/providers.js";

test("ParselyProvider returns provider information", t => {
    let provider = new ParselyProvider();
    t.is(provider.key, "PARSELY", "Key should always be PARSELY");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("ParselyProvider pattern should match various domains", t => {
    let provider = new ParselyProvider(),
        urls = [
            "https://p1.parsely.com/plogger/?rand=",
            "https://p1.parsely.com/px/?rand=",
            "https://p1-irl.parsely.com/px/?rand=",
            "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com",
            "http://p1.parsely.com/plogger/?rand=",
            "http://p1.parsely.com/px/?rand=",
            "http://p1-irl.parsely.com/px/?rand=",
            "http://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com",
        ],
        negativeUrls = [
            "https://omnibug.io/testing",
            "https://omnibug.io/collection",
            "https://p1.omnibug.io/plogger",
            "https://omnibug.io/px",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url), `Provider should match ${url}`);
    });
    negativeUrls.forEach((url) => {
        t.false(provider.checkUrl(url), `Provider should not match non-provider url ${url}`);
    });
});

test("OmnibugProvider returns Parsely", t => {
    let url = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data=%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=heartbeat&inc=5&tt=4908&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "PARSELY", "Results provider is Parse.ly");
});

test("ParselyProvider returns static data", t => {
    let provider = new ParselyProvider(),
        url = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data=%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=heartbeat&inc=5&tt=4908&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "PARSELY", "Results provider is Parse.ly");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("ParselyProvider returns the hit type", t => {
    let provider = new ParselyProvider(),
        url1 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data=%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=heartbeat&inc=5&tt=4908&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        url2 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data=%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=pageview&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        url3 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data=%7B%22test%22%3A%22true%22%2C%22_conversion_type%22%3A%22newsletter_signup%22%2C%22_conversion_label%22%3A%22sports%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=conversion&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        url4 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data%3D%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=videostart&metadata%3D%7B%22link%22%3A%22-EY97tZAkNY%22%2C%22duration%22%3A97000%2C%22title%22%3A%22a%20rainy%20afternoon%20in%20sweden%20~%20nordic%20lofi%20mix%22%2C%22image_url%22%3A%22http%3A%2F%2Fimg.youtube.com%2Fvi%2F-EY97tZAkNY%2F0.jpg%22%2C%22author%22%3A%22Cozy%20Nordic%22%2C%22video_platform%22%3A%22youtube%22%7D&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&vsid=xeam498w-88dp-127e-jcii-cblgup4z2qte&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        url5 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data%3D%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=vheartbeat&inc=1&metadata%3D%7B%22link%22%3A%22-EY97tZAkNY%22%2C%22duration%22%3A97000%2C%22title%22%3A%22a%20rainy%20afternoon%20in%20sweden%20~%20nordic%20lofi%20mix%22%2C%22image_url%22%3A%22http%3A%2F%2Fimg.youtube.com%2Fvi%2F-EY97tZAkNY%2F0.jpg%22%2C%22author%22%3A%22Cozy%20Nordic%22%2C%22video_platform%22%3A%22youtube%22%7D&tt=695&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&vsid=xeam498w-88dp-127e-jcii-cblgup4z2qte&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        url6 = "https://p1.parsely.com/plogger/?rand=1234567890123&plid=w8a7jtgi-q7zy-gb47-b8sc-op8kqqcbzl96&idsite=test.com&url=https%3A%2F%2Ftest.com%2Ftest%2F&urlref=https%3A%2F%2Fwww.google.com%2F&screen=3360x1890%7C3360x1865%7C24&data%3D%7B%22test%22%3A%22true%22%7D&sid=12&surl=https%3A%2F%2Ftest.com%2Ftest%2F&sref=https%3A%2F%2Fwww.google.com%2F&sts=1685526045351&slts=1676972759016&date=Wed+May+31+2023+10%3A43%3A14+GMT%2B0100+(British+Summer+Time)&action=test&inc=1&metadata%3D%7B%22link%22%3A%22-EY97tZAkNY%22%2C%22duration%22%3A97000%2C%22title%22%3A%22a%20rainy%20afternoon%20in%20sweden%20~%20nordic%20lofi%20mix%22%2C%22image_url%22%3A%22http%3A%2F%2Fimg.youtube.com%2Fvi%2F-EY97tZAkNY%2F0.jpg%22%2C%22author%22%3A%22Cozy%20Nordic%22%2C%22video_platform%22%3A%22youtube%22%7D&tt=695&pvid=dh52q4j0-sb98-9k01-14ql-k7471gzggc15&vsid=xeam498w-88dp-127e-jcii-cblgup4z2qte&u=pid%3Ds1qszb2j-q5wm-17do-aufa-8bokudx1gbcc",
        results1 = provider.parseUrl(url1),
        results2 = provider.parseUrl(url2),
        results3 = provider.parseUrl(url3),
        results4 = provider.parseUrl(url4),
        results5 = provider.parseUrl(url5),
        results6 = provider.parseUrl(url6);

    let requestType1 = results1.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType2 = results2.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType3 = results3.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType4 = results4.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType5 = results5.data.find((result) => {
            return result.key === "omnibug_requestType";
        }),
            requestType6 = results6.data.find((result) => {
            return result.key === "omnibug_requestType";
        });

    t.is(typeof requestType1, "object");
    t.is(requestType1.value, "Heartbeat");
    t.is(typeof requestType2, "object");
    t.is(requestType2.value, "Page View");
    t.is(typeof requestType3, "object");
    t.is(requestType3.value, "Conversion");
    t.is(typeof requestType4, "object");
    t.is(requestType4.value, "Video Start");
    t.is(typeof requestType5, "object");
    t.is(requestType5.value, "Video Heartbeat");
    t.is(typeof requestType6, "object");
    t.is(requestType6.value, "Test");
});
