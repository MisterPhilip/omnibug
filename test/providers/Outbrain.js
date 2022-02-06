import test from "ava";

import { default as OutbrainProvider } from "./../source/providers/Outbrain.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Outbrain Provider Information", t => {
  let provider = new OutbrainProvider();
  t.is(provider.key, "OUTBRAIN", "Key should always be OUTBRAIN");
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

test("Pattern should match Outbrain event requests", t => {
  let provider = new OutbrainProvider(),
    url =
      "https://tr.outbrain.com/unifiedPixel?marketerId=004e6e2a8dddb574d007a0de6dfc517063,00c8f9e47f3276f93622bf0fc68f3902e8,000e82d9fd79b774dfc2addc8ab340a83b&obApiVersion=1.0-gtm&obtpVersion=1.5.2&name=PAGE_VIEW&dl=https%3A%2F%2Fwww.outbrain.com%2F&optOut=false&bust=012238395391955281";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns OutbrainProvider", t => {
  let url =
    "https://tr.outbrain.com/unifiedPixel?marketerId=004e6e2a8dddb574d007a0de6dfc517063,00c8f9e47f3276f93622bf0fc68f3902e8,000e82d9fd79b774dfc2addc8ab340a83b&obApiVersion=1.0-gtm&obtpVersion=1.5.2&name=PAGE_VIEW&dl=https%3A%2F%2Fwww.outbrain.com%2F&optOut=false&bust=012238395391955281";

  let results = OmnibugProvider.parseUrl(url),
      requestTypeParsed = results.data.find(result => {
          return result.key === "requestTypeParsed";
      });
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "OUTBRAIN", "Results provider is Outbrain");
  t.is(requestTypeParsed.value, "Page View");
});

test("Other parameters group populates with non-c parameters", t => {
  let provider = new OutbrainProvider(),
    url =
      "https://tr.outbrain.com/unifiedPixel?orderValue=12.25&currency=USD&orderId=abc123&foo=bar&marketerId=004e6e2a8dddb574d007a0de6dfc517063,00c8f9e47f3276f93622bf0fc68f3902e8,000e82d9fd79b774dfc2addc8ab340a83b&obApiVersion=1.0-gtm&obtpVersion=1.5.2&name=purchase&dl=https%3A%2F%2Fwww.outbrain.com%2F&optOut=false&bust=08710561393380354";

  let results = provider.parseUrl(url);
  let orderValue = results.data.find(result => {
        return result.key === "orderValue";
      }),
      requestTypeParsed = results.data.find(result => {
        return result.key === "requestTypeParsed";
    });

  t.is(typeof orderValue, "object");
  t.is(orderValue.field, "Order Value");
  t.is(orderValue.value, "12.25");
  t.is(orderValue.group, "event");

  t.is(requestTypeParsed.value, "purchase");
});
