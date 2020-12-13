import test from 'ava';

import { default as AdobeHeartbeatProvider } from "./../source/providers/AdobeHeartbeat.js";
import { OmnibugProvider } from "./../source/providers.js";

test("AdobeHeartbeatProvider returns provider information", (t) => {
    let provider = new AdobeHeartbeatProvider();
    t.is(provider.key, "ADOBEHEARTBEAT", "Key should always be ADOBEHEARTBEAT");
    t.is(provider.type, "Analytics", "Type should always be analytics");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("AdobeHeartbeatProvider pattern should match Adobe Heartbeat calls", t => {
    let provider = new AdobeHeartbeatProvider(),
        urls = [
            "https://nbcume.hb.omtrdc.net/?s:sc:rsid=nbcutve%2Cnbcunetworkbu&s:sc:tracking_server=nbcume.sc.omtrdc.net&h:sc:ssl=1&s:user:aid=2D859E6B85035994-4000118EA001378C&s:user:mid=07193930379656792541444603315072046627&s:user:id=2D859E6B85035994-4000118EA001378C&s:aam:blob=RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&l:aam:loc_hint=9&s:sp:ovp=theplatform&s:sp:sdk=mpx-javascript-player-sdk&s:sp:channel=On-Domain&s:sp:player_name=PDK%206%20-%20NBC.com%20Instance%20of%3A%20rational-player-production&s:sp:hb_version=js-n-1.6.9.113-3dff70&l:sp:hb_api_lvl=4&s:event:sid=1527464150037459529420&s:event:type=start&l:event:duration=0&l:event:playhead=0&l:event:ts=1527464150048&l:event:prev_ts=-1&s:asset:type=main&s:asset:name=Town%20Hall&s:asset:video_id=3710748&s:asset:publisher=A8AB776A5245B4220A490D44%40AdobeOrg&l:asset:length=1330&s:stream:type=VOD%20Episode&l:stream:bitrate=0&l:stream:fps=0&l:stream:dropped_frames=0&l:stream:startup_time=0&s:meta:videoprogram=Superstore&s:meta:videotitle=Town%20Hall&s:meta:videodaypart=Primetime&s:meta:videominute=16%3A35&s:meta:videohour=16%3A00&s:meta:videoday=Sunday&s:meta:videodate=05%2F27%2F2018&s:meta:videoplayertech=HTML5%20Desktop&s:meta:videoplatform=PC&s:meta:videonetwork=NBC%20Entertainment&s:meta:videoinitiate=Manual&s:meta:videocliptype=Full%20Episode&s:meta:videosubcat1=Comedy&s:meta:videoscreen=Normal&s:meta:videostatus=Unrestricted&s:meta:videoplayerurl=https%3A%2F%2Fwww.nbc.com%2Fsuperstore%2Fvideo%2Ftown-hall%2F3710748&s:meta:videoepnumber=22&s:meta:videoguid=3710748&s:meta:videoairdate=5%2F3%2F2018&s:meta:videoseason=3&s:meta:videodescription=Glenn%20gets%20stage%20fright%20when%20he%20realizes%20his%20speech%20for%20Cloud%209%27s%20town%20hall%20will%20be%20broadcast%20live%20in%20stores%20around%20the%20world%2C%20and%20Amy%20and%20Jonah%20set%20out%20to%20discover%20the%20truth%20about%20a%20recent%20employee%20firing%20after%20Laurie%20makes%20a%20suspicious%20comment.&s:meta:a.nielsen.clientid=us-800148&s:meta:a.nielsen.vcid=c05&s:meta:a.nielsen.appid=P27B8D04D-DDA7-456D-954F-7F032457B022&s:meta:a.nielsen.program=Superstore&s:meta:a.nielsen.sega=Town%20Hall&s:meta:a.nielsen.admodel=2&s:meta:a.nielsen.accmethod=0&s:meta:a.nielsen.ctype=VIDEO",
            "https://obumobile5.hb-api.omtrdc.net/api/v1/sessions",
            "https://obumobile5.hb-api.omtrdc.net/api/v1/sessions/139bd3c6f625bfb71e40a328e40512e3c506035d4d0dad024587ba2b442a5cb0/events",
            "https://hb-test.omnibug.io/api/v1/sessions",
            "https://hb-test.omnibug.io/api/v1/sessions/139bd3c6f625bfb71e40a328e40512e3c506035d4d0dad024587ba2b442a5cb0/events",
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://omnibug.io/testing"), "Provider should not match on non-provider based URLs");
});

test("OmnibugProvider returns Adobe Heartbeat v1/v2", t => {
    let url = "https://nbcume.hb.omtrdc.net/?s:sc:rsid=nbcutve%2Cnbcunetworkbu&s:sc:tracking_server=nbcume.sc.omtrdc.net&h:sc:ssl=1&s:user:aid=2D859E6B85035994-4000118EA001378C&s:user:mid=07193930379656792541444603315072046627&s:user:id=2D859E6B85035994-4000118EA001378C&s:aam:blob=RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y&l:aam:loc_hint=9&s:sp:ovp=theplatform&s:sp:sdk=mpx-javascript-player-sdk&s:sp:channel=On-Domain&s:sp:player_name=PDK%206%20-%20NBC.com%20Instance%20of%3A%20rational-player-production&s:sp:hb_version=js-n-1.6.9.113-3dff70&l:sp:hb_api_lvl=4&s:event:sid=1527464150037459529420&s:event:type=start&l:event:duration=0&l:event:playhead=0&l:event:ts=1527464150048&l:event:prev_ts=-1&s:asset:type=main&s:asset:name=Town%20Hall&s:asset:video_id=3710748&s:asset:publisher=A8AB776A5245B4220A490D44%40AdobeOrg&l:asset:length=1330&s:stream:type=VOD%20Episode&l:stream:bitrate=0&l:stream:fps=0&l:stream:dropped_frames=0&l:stream:startup_time=0&s:meta:videoprogram=Superstore&s:meta:videotitle=Town%20Hall&s:meta:videodaypart=Primetime&s:meta:videominute=16%3A35&s:meta:videohour=16%3A00&s:meta:videoday=Sunday&s:meta:videodate=05%2F27%2F2018&s:meta:videoplayertech=HTML5%20Desktop&s:meta:videoplatform=PC&s:meta:videonetwork=NBC%20Entertainment&s:meta:videoinitiate=Manual&s:meta:videocliptype=Full%20Episode&s:meta:videosubcat1=Comedy&s:meta:videoscreen=Normal&s:meta:videostatus=Unrestricted&s:meta:videoplayerurl=https%3A%2F%2Fwww.nbc.com%2Fsuperstore%2Fvideo%2Ftown-hall%2F3710748&s:meta:videoepnumber=22&s:meta:videoguid=3710748&s:meta:videoairdate=5%2F3%2F2018&s:meta:videoseason=3&s:meta:videodescription=Glenn%20gets%20stage%20fright%20when%20he%20realizes%20his%20speech%20for%20Cloud%209%27s%20town%20hall%20will%20be%20broadcast%20live%20in%20stores%20around%20the%20world%2C%20and%20Amy%20and%20Jonah%20set%20out%20to%20discover%20the%20truth%20about%20a%20recent%20employee%20firing%20after%20Laurie%20makes%20a%20suspicious%20comment.&s:meta:a.nielsen.clientid=us-800148&s:meta:a.nielsen.vcid=c05&s:meta:a.nielsen.appid=P27B8D04D-DDA7-456D-954F-7F032457B022&s:meta:a.nielsen.program=Superstore&s:meta:a.nielsen.sega=Town%20Hall&s:meta:a.nielsen.admodel=2&s:meta:a.nielsen.accmethod=0&s:meta:a.nielsen.ctype=VIDEO";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEHEARTBEAT", "Results provider is Adobe Heartbeat");
});

test("OmnibugProvider returns Adobe Heartbeat v3", t => {
    let url = "https://obumobile5.hb-api.omtrdc.net/api/v1/sessions";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "ADOBEHEARTBEAT", "Results provider is Adobe Heartbeat");
});

test("AdobeHeartbeatProvider returns data for v3", t => {
    let provider = new AdobeHeartbeatProvider(),
        url = "https://obumobile5.hb-api.omtrdc.net/api/v1/sessions/139bd3c6f625bfb71e40a328e40512e3c506035d4d0dad024587ba2b442a5cb0/events",
        postData = `{"eventType":"adStart","playerTime":{"playhead":14.965013,"ts":1607292775736},"customMetadata":{"affiliate":"Sample affiliate","campaign":"Sample ad campaign"},"params":{"media.ad.name":"Sample ad","media.ad.id":"001","media.ad.length":15,"media.ad.podPosition":1,"media.ad.advertiser":"Sample Advertiser","media.ad.campaignId":"Sample Campaign","media.ad.playerName":"HTML5 basic media player"}}`;

    let results = provider.parseUrl(url, postData),
        eventType = results.data.find(r => r.key === "eventType"),
        playhead = results.data.find(r => r.key === "playerTime.playhead"),
        sessionId = results.data.find(r => r.key === "omnibug_sessionID");

    t.is(eventType.field, "Event Type");
    t.is(eventType.value, "adStart");
    t.is(eventType.group, "general");

    t.is(playhead.field, "playhead");
    t.is(playhead.value, "14.965013");
    t.is(playhead.group, "player");

    t.is(sessionId.field, "Media Session ID");
    t.is(sessionId.value, "139bd3c6f625bfb71e40a328e40512e3c506035d4d0dad024587ba2b442a5cb0");
    t.is(sessionId.group, "general");
});

test.todo("AdobeHeartbeatProvider returns static data");
test.todo("AdobeHeartbeatProvider returns custom data");
