import test from 'ava';

import { default as PinterestProvider } from "../source/providers/Pinterest";
import { OmnibugProvider } from "../source/providers.js";

const PIXEL_ID = "PINTERESTPIXEL";

test("PinterestProvider returns provider information", (t) => {
    let provider = new PinterestProvider();
    t.is(provider.key, PIXEL_ID, "Key should always be PINTEREST");
    t.is(provider.type, "Marketing", "Type should always be marketing");
    t.true(typeof provider.name === "string" && provider.name !== "", "Name should exist");
    t.true(typeof provider.pattern === 'object' && provider.pattern instanceof RegExp, "Pattern should be a RegExp value");
});

test("PinterestProvider pattern should match Pinterest calls", t => {
    let provider = new PinterestProvider(),
        urls = [
            "https://ct.pinterest.com/v3/?tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&event=init&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583538016603",
            "https://ct.pinterest.com/v3/?event=checkout&ed=%7B%22value%22%3A116%2C%22order_quantity%22%3A2%2C%22currency%22%3A%22USD%22%2C%22line_items%22%3A%5B%7B%22product_name%22%3A%22Pillows%20(Set%20of%202)%22%2C%22product_id%22%3A%2211%22%2C%22product_price%22%3A48%2C%22product_quantity%22%3A1%7D%2C%7B%22product_name%22%3A%22Pillows%2C%20Large%20(Set%20of%202)%22%2C%22product_id%22%3A%2215%22%2C%22product_price%22%3A68%2C%22product_quantity%22%3A1%7D%5D%7D&tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583538017548"
        ],
        badUrls = [
            "https://ct.pinterest.com/user/?tid=1235871753249&cb=1233538014046",
            "https://s.pinimg.com/ct/lib/main.123abc.js",
            "https://omnibug.io/testing"
        ];

    urls.forEach((url) => {
        t.true(provider.checkUrl(url));
    });

    badUrls.forEach((url) => {
        t.false(provider.checkUrl(url), "Provider should not match on non-provider based URLs");
    });
});

test("OmnibugProvider returns Pinterest", t => {
    let url = "https://ct.pinterest.com/v3/?tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&event=init&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583538016603",
        results = OmnibugProvider.parseUrl(url);
    t.true(typeof results === "object" && results !== null, "Results is a non-null object");
    t.is(results.provider.key, PIXEL_ID, "Results provider is Pinterest");
});

test("PinterestProvider returns data", t => {
    let provider = new PinterestProvider(),
        url = "https://ct.pinterest.com/v3/?tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&event=init&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583538016603",
        results = provider.parseUrl(url),
        tagID = results.data.find((result) => {
            return result.key === "tid";
        }),
        hashedEmail = results.data.find((result) => {
            return result.key === "pd[em]";
        });

    t.is(typeof tagID, "object");
    t.is(tagID.field, "Tag ID");
    t.is(tagID.value, "abc123");

    t.is(typeof hashedEmail, "object");
    t.is(hashedEmail.field, "Hashed Email Address");
    t.is(hashedEmail.value, "f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a");
});

test("PinterestProvider returns requestType", t => {
    let provider = new PinterestProvider(),
        initUrl = "https://ct.pinterest.com/v3/?tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&event=init&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868241843",
        pageViewUrl = "https://ct.pinterest.com/v3/?tid=abc123&event=pagevisit&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868536108",
        purchaseUrl = "https://ct.pinterest.com/v3/?event=checkout&ed=%7B%22value%22%3A116%2C%22order_quantity%22%3A2%2C%22currency%22%3A%22USD%22%2C%22line_items%22%3A%5B%7B%22product_name%22%3A%22Pillows%20(Set%20of%202)%22%2C%22product_id%22%3A%2211%22%2C%22product_price%22%3A48%2C%22product_quantity%22%3A1%7D%2C%7B%22product_name%22%3A%22Pillows%2C%20Large%20(Set%20of%202)%22%2C%22product_id%22%3A%2215%22%2C%22product_price%22%3A68%2C%22product_quantity%22%3A1%7D%5D%7D&tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868246432",
        initParsed = provider.parseUrl(initUrl),
        pageViewParsed = provider.parseUrl(pageViewUrl),
        purchaseParsed = provider.parseUrl(purchaseUrl),
        initResult = initParsed.data.find((result) => {
            return result.key === "requestType";
        }),
        pageViewResult = pageViewParsed.data.find((result) => {
            return result.key === "requestType";
        }),
        purchaseResult = purchaseParsed.data.find((result) => {
            return result.key === "requestType";
        });

    t.is(typeof initResult, "object");
    t.is(initResult.value, "Init");

    t.is(typeof pageViewResult, "object");
    t.is(pageViewResult.value, "Page View");

    t.is(typeof purchaseResult, "object");
    t.is(purchaseResult.value, "Checkout");
});

test("PinterestProvider returns ecom data", t => {
    let provider = new PinterestProvider(),
        url = "https://ct.pinterest.com/v3/?event=checkout&ed=%7B%22value%22%3A116%2C%22order_quantity%22%3A2%2C%22currency%22%3A%22USD%22%2C%22line_items%22%3A%5B%7B%22product_name%22%3A%22Pillows%20(Set%20of%202)%22%2C%22product_id%22%3A%2211%22%2C%22product_price%22%3A48%2C%22product_quantity%22%3A1%7D%2C%7B%22product_name%22%3A%22Pillows%2C%20Large%20(Set%20of%202)%22%2C%22product_id%22%3A%2215%22%2C%22product_price%22%3A68%2C%22product_quantity%22%3A1%7D%5D%7D&tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868246432",
        parsed = provider.parseUrl(url),
        prod1Name = parsed.data.find((result) => {
            return result.key === "ed[line_items][0][product_name]";
        }),
        prod2Qty = parsed.data.find((result) => {
            return result.key === "ed[line_items][1][product_quantity]";
        }),
        orderValue = parsed.data.find((result) => {
            return result.key === "ed[value]";
        });

    t.is(typeof prod1Name, "object");
    t.is(prod1Name.field, "Product 1 Name");
    t.is(prod1Name.value, "Pillows (Set of 2)");

    t.is(typeof prod2Qty, "object");
    t.is(prod2Qty.field, "Product 2 Quantity");
    t.is(prod2Qty.value, 1);

    t.is(typeof orderValue, "object");
    t.is(orderValue.field, "Revenue");
    t.is(orderValue.value, 116);
});

test("PinterestProvider allows new data points", t => {
    let provider = new PinterestProvider(),
        url = "https://ct.pinterest.com/v3/?event=checkout&ed=%7B%22value%22%3A116%2C%22order_quantity%22%3A2%2C%22currency%22%3A%22USD%22%2C%22transaction_id%22%3A%22AAAA123%22%2C%22line_items%22%3A%7B%22product_name%22%3A%22Pillows%20(Set%20of%202)%22%2C%22product_id%22%3A%2211%22%2C%22product_price%22%3A48%2C%22product_quantity%22%3A1%7D%7D&tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22%7D&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868246432",
        parsed = provider.parseUrl(url),
        orderID = parsed.data.find((result) => {
            return result.key === "ed[transaction_id]";
        });

    t.is(typeof orderID, "object");
    t.is(orderID.field, "ed[transaction_id]");
    t.is(orderID.value, "AAAA123");
});

test("PinterestProvider handles bad data", t => {
    let provider = new PinterestProvider(),
        url = "https://ct.pinterest.com/v3/?event=checkout&ed=%7B%22value%22%3A116%2C%22order_quantity%22%3A2%2C%22currency%22%3A%22USD%22%2C%22order_id%22%3A%22AAAA123%22%2C%22line_items%22%3A%7B%22product_name%22%3A%22Pillows%20(Set%20of%202)%22%2C%22product_id%22%3A%2211%22%2C%22product_price%22%3A48%2C%22product_quantity%22%3A1%7D&tid=abc123&pd=%7B%22em%22%3A%22f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a%22&ad=%7B%22loc%22%3A%22https%3A%2F%2Fwww.example.com%2F%22%2C%22ref%22%3A%22%22%2C%22if%22%3Afalse%2C%22sh%22%3A1440%2C%22sw%22%3A2560%7D&cb=1583868246432",
        parsed = provider.parseUrl(url),
        pageData = parsed.data.find((result) => {
            return result.key === "pd";
        }),
        eventData = parsed.data.find((result) => {
            return result.key === "ed";
        });
    
    t.is(typeof pageData, "object");
    t.is(pageData.value, `{"em":"f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a"`);

    t.is(typeof eventData, "object");
    t.is(eventData.value, `{"value":116,"order_quantity":2,"currency":"USD","order_id":"AAAA123","line_items":{"product_name":"Pillows (Set of 2)","product_id":"11","product_price":48,"product_quantity":1}`);
});