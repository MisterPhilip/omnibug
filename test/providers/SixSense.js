import test from "ava";

import { default as SixSenseProvider } from "./../source/providers/SixSense.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic 6Sense Provider Information", t => {
  let provider = new SixSenseProvider();
  t.is(provider.key, "SIXSENSE", "Key should always be SIXSENSE");
  t.is(provider.type, "Visitor Identification", "Type should always be marketing");
  t.true(
    typeof provider.name === "string" && provider.name !== "",
    "Name should exist"
  );
  t.true(
    typeof provider.pattern === "object" && provider.pattern instanceof RegExp,
    "Pattern should be a RegExp value"
  );
});

test("Pattern should match 6Sense event requests", t => {
  let provider = new SixSenseProvider(),
    url = "https://epsilon.6sense.com/v3/company/details";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns 6SenseProvider", t => {
  let url = "https://epsilon.6sense.com/v3/company/details";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "SIXSENSE", "Results provider is 6Sense");
});
