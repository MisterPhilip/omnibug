import test from "ava";

import { default as DemandbaseEngagementProvider } from "./../source/providers/DemandbaseEngagement.js";
import { OmnibugProvider } from "./../source/providers.js";

test("Generic Demandbase Engagement Provider Information", t => {
  let provider = new DemandbaseEngagementProvider();
  t.is(provider.key, "DEMANDBASEENGAGEMENT", "Key should always be DEMANDBASEENGAGEMENT");
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

test("Pattern should match Demandbase Engagement event requests", t => {
  let provider = new DemandbaseEngagementProvider(),
    url = "https://api.company-target.com/api/v2/ip.json?key=11110bc7e4495aa701b66129ecf5f805";

  t.true(provider.checkUrl(url));

  t.false(
    provider.checkUrl("https://omnibug.io/testing"),
    "Provider should not match on non-provider based URLs"
  );
});

test("OmnibugProvider returns Demandbase EngagementProvider", t => {
  let url = "https://api.company-target.com/api/v2/ip.json?key=11110bc7e4495aa701b66129ecf5f805";

  let results = OmnibugProvider.parseUrl(url);
  t.true(
    typeof results === "object" && results !== null,
    "Results is a non-null object"
  );
  t.is(results.provider.key, "DEMANDBASEENGAGEMENT", "Results provider is Demandbase Engagement");
});

test("Custom parameters group populates with c parameters", t => {
  let provider = new DemandbaseEngagementProvider(),
    url = "https://api.company-target.com/api/v2/ip.json?referrer=&page=https%3A%2F%2Fomnibug.io%2F&page_title=Omnibug&src=tag&key=11110bc7e4495aa701b66129ecf5f805";

  let results = provider.parseUrl(url);
  let page = results.data.find(result => {
      return result.key === "page";
    }),
      key = results.data.find(result => {
      return result.key === "key";
    });

  t.is(typeof page, "object");
  t.is(page.field, "Page URL");
  t.is(page.value, "https://omnibug.io/");

  t.is(typeof key, "object");
  t.is(key.field, "Account ID");
  t.is(key.value, "11110bc7e4495aa701b66129ecf5f805");
});
