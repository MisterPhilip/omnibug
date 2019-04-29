import test from 'ava';

import { default as FacebookPixelProvider } from "./../source/providers/FacebookPixel.js";
import { OmnibugProvider } from "./../source/providers.js";

test("FacebookPixelProvider returns provider information", t => {
    let provider = new FacebookPixelProvider();
    t.is(provider.key, "FACEBOOKPIXEL", "Key should always be FACEBOOKPIXEL");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("FacebookPixelProvider pattern should match various FB domains", t => {
    let provider = new FacebookPixelProvider(),
        urls = [
            "http://www.facebook.com/tr/?id=123456&",
            "https://www.facebook.com/tr/?id=123456&",
            "http://www.facebook.com/tr?id=123456&",
            "https://www.facebook.com/tr?id=123456&"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    t.false(provider.checkUrl("https://connect.facebook.net/signals/config/123456?v=2.8.18&r=stable"), "Provider should not match on non-provider based URLs");
    t.false(provider.checkUrl("https://www.facebook.com/tr?id=123456&ev=Microdata"), "Provider should not match the microdata event");
});

test("OmnibugProvider returns FacebookPixelProvider", t => {
    let url = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530050173791&cd[contents]=%5B%7B%22id%22%3A%221234%22%2C%22quantity%22%3A2%2C%22item_price%22%3A10%7D%2C%7B%22id%22%3A%224642%22%2C%22quantity%22%3A1%2C%22item_price%22%3A5%7D%5D&cd[content_type]=product&cd[value]=25&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530050173751";

    let results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, "FACEBOOKPIXEL", "Results provider is Facebook Pixel");
});

test("FacebookPixelProvider returns static data", t => {
    let provider = new FacebookPixelProvider(),
        url = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530050173791&cd[contents]=%5B%7B%22id%22%3A%221234%22%2C%22quantity%22%3A2%2C%22item_price%22%3A10%7D%2C%7B%22id%22%3A%224642%22%2C%22quantity%22%3A1%2C%22item_price%22%3A5%7D%5D&cd[content_type]=product&cd[value]=25&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530050173751";

    let results = provider.parseUrl(url);

    t.is(typeof results.provider, "object", "Results has provider information");
    t.is(results.provider.key, "FACEBOOKPIXEL", "Results provider is Facebook Pixel");
    t.is(typeof results.data, "object", "Results has data");
    t.true(results.data.length > 0, "Data is returned");
});

test("FacebookPixelProvider returns the hit type", t => {
    let provider = new FacebookPixelProvider(),
        purchaseUrl = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530050173791&cd[contents]=%5B%7B%22id%22%3A%221234%22%2C%22quantity%22%3A2%2C%22item_price%22%3A10%7D%2C%7B%22id%22%3A%224642%22%2C%22quantity%22%3A1%2C%22item_price%22%3A5%7D%5D&cd[content_type]=product&cd[value]=25&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530050173751",
        pageViewUrl = "https://www.facebook.com/tr/?id=123456&ev=PageView&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530050173789&sw=2560&sh=1440&v=2.8.18&r=stable&ec=0&o=28&it=1530050173751";

    let purchaseResults = provider.parseUrl(purchaseUrl),
        pageViewResults = provider.parseUrl(pageViewUrl);

    let purchaseResultType = purchaseResults.data.find((result) => {
            return result.key === "requestType";
        }),
        pageViewResultType = pageViewResults.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof purchaseResultType, "object");
    t.is(purchaseResultType.value, "Purchase");

    t.is(typeof pageViewResultType, "object");
    t.is(pageViewResultType.value, "Page View");
});

test("FacebookPixelProvider returns event data", t => {
    let provider = new FacebookPixelProvider(),
        url = "https://www.facebook.com/tr/?id=123456&ev=ViewContent&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530051217734&cd[content_name]=The%20Avengers%20Trailer&cd[content_category]=Entertainment&cd[value]=1.5&cd[currency]=USD&cd[referrer]=&cd[userAgent]=Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F67.0.3396.99%20Safari%2F537.36&cd[language]=en-US&sw=2560&sh=1440&v=2.8.18&r=stable&ec=3&o=28&it=1530051217661";

    let results = provider.parseUrl(url);

    let category = results.data.find((result) => {
            return result.key === "cd[content_category]";
        }),
        language = results.data.find((result) => {
            return result.key === "cd[language]";
        });

    t.is(typeof category, "object");
    t.is(category.field, "Content Category");
    t.is(category.value, "Entertainment");
    t.is(category.group, "custom");

    t.is(typeof language, "object");
    t.is(language.field, "language");
    t.is(language.value, "en-US");
    t.is(language.group, "custom");
});

test("FacebookPixelProvider returns contents data", t => {
    let provider = new FacebookPixelProvider(),
        url = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530051217734&cd[contents]=%5B%7B%22id%22%3A%221234%22%2C%22quantity%22%3A2%2C%22item_price%22%3A10%2C%22category%22%3A%22foobar%22%7D%2C%7B%22id%22%3A%224642%22%2C%22quantity%22%3A1%2C%22item_price%22%3A5%2C%22category%22%3A%22foobar%22%7D%5D&cd[content_type]=product&cd[value]=25&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530051217661";

    let results = provider.parseUrl(url);

    let productPrice = results.data.find((result) => {
            return result.key === "cd[contents][0][item_price]";
        }),
        category = results.data.find((result) => {
            return result.key === "cd[contents][0][category]";
        });

    t.is(typeof productPrice, "object");
    t.is(productPrice.field, "Product 1 Price");
    t.is(productPrice.value, 10);
    t.is(productPrice.group, "products");

    t.is(typeof category, "object");
    t.is(category.field, "Product 1 category");
    t.is(category.value, "foobar");
    t.is(category.group, "products");
});

test("FacebookPixelProvider handles missing contents data", t => {
    let provider = new FacebookPixelProvider(),
        url = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530051535994&cd[contents]=%5B%5D&cd[content_type]=product&cd[value]=20&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530051535957";

    let results = provider.parseUrl(url);

    let contents = results.data.find((result) => {
        return result.key === "cd[contents]";
    });

    t.is(typeof contents, "undefined");
});

test("FacebookPixelProvider handles invalid contents data", t => {
    let provider = new FacebookPixelProvider(),
        url = "https://www.facebook.com/tr/?id=123456&ev=Purchase&dl=http%3A%2F%2Flocalhost%2Fomnibug%2Fproviders%2Ffacebook-pixel%2F&rl=&if=false&ts=1530051535994&cd[contents]=x%5B%7B%22id%22%3A%221234%22%2C%22quantity%22%3A2%2C%22item_price%22%3A10%7D%5D&cd[content_type]=product&cd[value]=20&cd[currency]=USD&sw=2560&sh=1440&v=2.8.18&r=stable&ec=4&o=28&it=1530051535957";

    let results = provider.parseUrl(url);

    let contents = results.data.find((result) => {
        return result.key === "cd[contents]";
    });

    t.is(typeof contents, "object");
    t.is(contents.field, "Content");
    t.is(contents.value, "x[{\"id\":\"1234\",\"quantity\":2,\"item_price\":10}]");
    t.is(contents.group, "products");
});