import test from "ava";

import { default as RedditPixelProvider } from "./../source/providers/RedditPixel.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Reddit Pixel Provider Information", t => {
  let provider = new RedditPixelProvider();
  t.is(provider.key, "REDDITPIXEL", "Key should always be REDDITPIXEL");
  t.is(provider.type, "Marketing", "Type should always be marketing");
  t.true(
    typeof provider.name === "string" && provider.name !== "",
    "Name should exist"
  );
  t.true(
    typeof provider.pattern === "object" && provider.pattern instanceof RegExp,
    "Pattern should be a RegExp value"
  );
});

test("Pattern should match Reddit Pixel event requests", t => {
  let provider = new RedditPixelProvider(),
    url = "https://alb.reddit.com/rp.gif?ts=1708362676211&id=xx_abc123z&event=AddToCart&m.itemCount=2&m.value=&m.valueDecimal=20&m.currency=USD&m.transactionId=&m.customEventName=&m.products=&m.conversionId=&uuid=c6959068-f901-4338-a393-7dda9cbd1fc3&aaid=&em=&external_id=&idfa=&integration=reddit&opt_out=0&sh=2560&sw=1440&v=rdt_c9439d84&dpm=&dpcc=&dprc=";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns Reddit Pixel Provider", t => {
  let url = "https://alb.reddit.com/rp.gif?ts=1708362676211&id=xx_abc123z&event=AddToCart&m.itemCount=2&m.value=&m.valueDecimal=20&m.currency=USD&m.transactionId=&m.customEventName=&m.products=&m.conversionId=&uuid=c6959068-f901-4338-a393-7dda9cbd1fc3&aaid=&em=&external_id=&idfa=&integration=reddit&opt_out=0&sh=2560&sw=1440&v=rdt_c9439d84&dpm=&dpcc=&dprc=";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "REDDITPIXEL", "Results provider is Reddit Pixel");
});
