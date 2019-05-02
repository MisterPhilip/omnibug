import test from "ava";

import { default as ComscoreProvider } from "./../source/providers/Comscore.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Comscore Provider Information", t => {
  let provider = new ComscoreProvider();
  t.is(provider.key, "COMSCORE", "Key should always be COMSCORE");
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

test("Pattern should match Comscore event requests", t => {
  let provider = new ComscoreProvider(),
    url =
      "https://sb.scorecardresearch.com/p?c1=2&c2=123456789&ns_type=hidden&cv=2.0&cj=1&c4=https://www.example.com";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns ComscoreProvider", t => {
  let url =
    "https://sb.scorecardresearch.com/p?c1=2&c2=123456789&ns_type=hidden&cv=2.0&cj=1&c4=https://www.example.com";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "COMSCORE", "Results provider is Comscore");
});

test("Custom parameters group populates with c parameters", t => {
  let provider = new ComscoreProvider(),
    url =
      "https://sb.scorecardresearch.com/p?c1=2&c2=123456789&ns_type=hidden&cv=2.0&cj=1&c4=https://www.example.com";

  let results = provider.parseUrl(url);
  let c4 = results.data.find(result => {
      return result.key === "c4";
    }),
    cv = results.data.find(result => {
      return result.key === "cv";
    });

  t.is(typeof c4, "object", "c4 data is an object");
  t.is(c4.field, "c4", "c4 is field value");
  t.is(
    c4.value,
    "https://www.example.com",
    "c4 value is https://www.example.com"
  );
  t.is(c4.group, "custom", "c4 is in custom group");

  t.is(typeof cv, "object", "cv data is an object");
  t.is(cv.field, "cv", "cv is field value");
  t.is(cv.value, "2.0", "cv value is 2.0");
  t.is(cv.group, "custom", "cv is in custom group");
});

test("Other parameters group populates with non-c parameters", t => {
  let provider = new ComscoreProvider(),
    url =
      "https://sb.scorecardresearch.com/p?c1=2&c2=123456789&ns_type=hidden&cv=2.0&cj=1&c4=https://www.example.com";

  let results = provider.parseUrl(url);
  let ns_type = results.data.find(result => {
    return result.key === "ns_type";
  });

  t.is(typeof ns_type, "object", "ns_type data is an object");
  t.is(ns_type.field, "ns_type", "ns_type is field value");
  t.is(ns_type.value, "hidden", "ns_type value is hidden");
  t.is(ns_type.group, "other", "ns_type is in other group");
});
