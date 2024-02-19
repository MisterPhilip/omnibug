import test from "ava";

import { default as DynamicYieldProvider } from "./../source/providers/DynamicYield.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Dynamic Yield Provider Information", t => {
  let provider = new DynamicYieldProvider();
  t.is(provider.key, "DYNAMICYIELD", "Key should always be DYNAMICYIELD");
  t.is(provider.type, "UX Testing", "Type should always be testing");
  t.true(
    typeof provider.name === "string" && provider.name !== "",
    "Name should exist"
  );
  t.true(
    typeof provider.pattern === "object" && provider.pattern instanceof RegExp,
    "Pattern should be a RegExp value"
  );
});

test("Pattern should match Dynamic Yield event requests", t => {
  let provider = new DynamicYieldProvider(),
    url = "https://async-px.dynamicyield.com/uia?cnst=1&_=123456789";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns Dynamic Yield Provider", t => {
  let url = "https://async-px.dynamicyield.com/uia?cnst=1&_=123456789";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "DYNAMICYIELD", "Results provider is Dynamic Yield");
});
