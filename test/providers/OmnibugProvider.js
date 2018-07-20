import test from 'ava';

import { OmnibugProvider } from "./../source/providers/OmnibugProvider.js";
import { default as BaseProvider } from "./../source/providers/BaseProvider.js";

// Sample provider to play with
class OmnibugTestProvider extends BaseProvider {
    constructor()
    {
        super();
        this._key        = "OMNIBUG-TEST-PROVIDER";
        this._pattern    = /omnibug\-test\-provider\-6548713/;
        this._name       = "Omnibug Test Provider";
        this._type       = "analytics";
    }
}
class OmnibugTestProvider2 extends BaseProvider {
    constructor()
    {
        super();
        this._key        = "OMNIBUG-TEST-PROVIDER-2";
        this._pattern    = /omnibug\-test\-provider\-321789/;
        this._name       = "Omnibug Test Provider 2";
        this._type       = "analytics";
    }
}

test("Patterns should exist", t => {
    let defaultPattern = OmnibugProvider.getPattern();

    t.true(defaultPattern instanceof RegExp, "Default pattern should be a RegExp object");
});

test("Patterns should only return for enabled providers", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    OmnibugProvider.addProvider(new OmnibugTestProvider2());
    let testPattern = OmnibugProvider.getPattern({"OMNIBUG-TEST-PROVIDER": {"enabled": false}, "OMNIBUG-TEST-PROVIDER-2": {"enabled": true}});

    t.is(testPattern.source, /omnibug\-test\-provider\-321789/.source, "Pattern should be a RegExp object");
});

test("Providers should be returned", t => {
    let providers = OmnibugProvider.getProviders();

    t.true(Object.keys(providers).length > 0, "At least 1 provider is returned");
});

test("Provider should be added", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    let providers = OmnibugProvider.getProviders();

    t.is(typeof providers["OMNIBUG-TEST-PROVIDER"], "object", "Test provider was added");
});

test("Check URL", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    let shouldParse = OmnibugProvider.checkUrl("https://omnibug-test-provider-6548713.com/?test=true"),
        shouldNotParse = OmnibugProvider.checkUrl("https://omnibug-test-provider-6548x713.com/?test=true");

    t.true(shouldParse, "Sample URL should be parsed");
    t.false(shouldNotParse, "Sample URL should not be parsed");
});

test("getProviderForUrl should return test provider", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    let provider = OmnibugProvider.getProviderForUrl("https://abc123.com/?test=true");

    t.is(provider.key, "");
});

test("getProviderForUrl should return base provider if no matches", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    let provider = OmnibugProvider.getProviderForUrl("https://omnibug-test-provider-6548713.com/?test=true");

    t.is(provider.key, "OMNIBUG-TEST-PROVIDER");
});

test("parseURL should return test provider's data", t => {
    OmnibugProvider.addProvider(new OmnibugTestProvider());
    let provider = OmnibugProvider.parseUrl("https://omnibug-test-provider-6548713.com/?test=true");

    t.is(provider.provider.key, "OMNIBUG-TEST-PROVIDER");
});