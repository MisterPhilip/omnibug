Contributing to Omnibug
==========

Omnibug wouldn't be here today without community contributions. We plan to keep Omnibug open sourced for the foreseeable 
future, and depend on volunteer's time to keep Omnibug running. 

## On this page

 * [Issues or Bugs](#issues-or-bugs)
 * [Installing locally](#installing-locally)
   * [Chrome](#chrome)
   * [Firefox](#firefox)
 * [Coding Styles](#coding-styles)
 * [Adding a Provider](#adding-a-provider)
   * [Provider Basics](#provider-basics)
     * [Parameter Syntax](#parameter-syntax)
   * [Methods](#methods)
     * [Constructor](#constructor)
     * [get columnMapping](#get-columnmapping)
     * [get groups](#get-groups)
     * [get keys](#get-keys)
     * [parseUrl](#parseurl)
     * [parsePostData](#parsepostdata)
     * [handleQueryParam](#handlequeryparam)
     * [handleCustom](#handlecustom)
   * [Adding a Test Suite](#adding-a-test-suite)
 * [Testing](#testing)
 * [Building](#building)
 * [Getting Help](#getting-help)
 
### Issues or Bugs
Find an issue? That's not good! Here's a list of information that we needed when opening a Github issue:

 * The browser name & version
 * OS name & version
 * Version of Omnibug you're running (clicking on "More" next to Omnibug in Firefox will show this)
 * The issue you're having
 * A way to replicate it (ideally a page we can access)

### Installing locally

To do any work, fork the original repository, and clone it locally. Then, install via [yarn](https://yarnpkg.com/):
```
$ yarn install
```

The installation process will download and install all of the requirements needed to build and develop Omnibug, as well 
as run an initial build so you can immediately start using the development version. 

Once installed on your machine, you can install as a developer / local version in Chrome and Firefox. You only need to 
install them once within the respective browser. If you make any updates to the codebase (e.g. `yarn run build`), you will
need to click the refresh button within the browser's extension page. This prevents you from seeing the omnibug.io/installed 
page multiple times.

##### Chrome
To install the local version in Chrome, go to the [chrome://extensions/](Extensions) settings, then be sure "Developer Mode" 
is checked. Once developer mode is enabled, select "Load unpacked extension..." and point to the `/platform/chromium/manifest.json` 
file. Learn more at [Google's docs](https://developer.chrome.com/extensions/getstarted).

##### Firefox
To install the local version in Firefox, go to the [about:addons](Add-ons Manager), then click the settings/gear icon. 
From there, select "[Debug Add-ons](about:debugging#addons)", and then select "Load Temporary Add-on" and point to the `/platform/firefox/manifest.json` 
file. Learn more at [Mozilla's docs](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).

##### Edge
To install the local version in Edge, go to the [edge://extensions/](Extensions) settings, then be sure "Developer Mode" 
is checked. Once developer mode is enabled, select "Load unpacked extension..." and point to the `/platform/chromium/manifest.json` 
file. Learn more at [Microsoft's docs](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/).


### Coding Styles

We use [ESLint](https://eslint.org/) to ensure a consistent code style. Here are some basic guidelines though:

* Since we only support the latest few versions of Chrome and Firefox, we can safely use most of the ES6 features. Please 
consider using these instead of outdated methods, as the ES6 version will provider a cleaner and faster code base.
* Use 4 spaces for 1 tab
* Any function, method, or class should have be declared on a it's own line
  * A [JSDoc comment](http://usejsdoc.org/) should be included for each function, method, or class
* Use double quotes or template syntax (backticks) where possible
* if / else statements should (_always_) have opening & closing brackets inline 
* Run `yarn run lint` to view issues, and `yarn run lint:fix` to fix them. When you build, ESLint will run in the background and fail the build 
if there are errors

### Adding a Provider

A provider is simply a marketing technology that exists in Omnibug. This could be a tool for analytics, re-marketing, 
UX-testing, etc. You can find a full list of providers in [our source code](https://github.com/MisterPhilip/omnibug/tree/master/src/providers).
It is recommended to review a few existing providers to understand how providers can be setup. 

#### Provider Basics

Every provider extends the [`BaseProvider` class](https://github.com/MisterPhilip/omnibug/blob/master/src/providers/BaseProvider.js). 
The bare minimum requirement is to set the [`constructor()` method](#constructor), all other properties do not need to 
override the `BaseProvider` implementation. However, it is recommended to extend several properties and methods to allow 
for full customization and create a better user experience within Omnibug.

##### Parameter Syntax

When working with providers, it is important to understand how we define a parameter. A parameter can come from multiple 
locations: 

1. A URL parameter, e.g. `foo` in `https://omnibug.io/?foo=abc123`
1. A parameter passed in the POST request (_see: [parsePostData()](#parsePostData)_)
1. A custom value you've passed via [handleQueryParam()](#handleQueryParam) or [handleCustom()](#handleCustom)

No matter where the parameter value comes from, the syntax remains the same:
```json
{
  "key": "Parameter key",
  "name": "Friendly Parameter Name",
  "group": "Group ID",
  "hidden": false,
  "value": "the value passed to the provider for this parameter"
}
```

 * `key` should be the unique identifier to the parameter. If from a URL or POST data, it should be the parameter's key. 
 If the parameter is dynamically created, please be sure to create a unique identifier.
 * `field` should be the friendly name of the parameter, which is shown in the interface to the user
 * `group` should be the `key` of the group you want this parameter to be grouped into, (_see: [get groups()](#get-groups)_)
 * `value` should be the value of the parameter, as passed to the provider
 * `hidden` can be set to `true` to hide this parameter from the interface. This is useful for times when want to further 
 manipulate the parameter in the `handleQueryParam` or `handleCustom` methods, and can be omitted or set to `false` to be shown.

#### Methods

These methods are set within `BaseProvider` and can be extended as needed.

##### Constructor

The `constructor()` method sets 4 required fields, as noted below. You should always have a `constructor()` method in 
your provider.

  * `this._key` should be set to a unique identifier for the provider. This is usually the provider's name, but with only 
  alphanumeric characters, forced to uppercase. 
  * `this._pattern` should be a RegExp pattern that matches the URL request of the provider. This should be as specific 
  as possible to prevent false matches, however it should be flexible enough for all of the various types of requests 
  the provider sends. This RegExp matches against the full URL, but does _not_ match against any POST data.
  * `this._name` should be the provider's official name.
  * `this._type` should be one of the keys found in `BaseProvider`'s `type()` method, e.g. `analytics` or `marketing`. 
  Should your provider not fall into any of these categories, please suggest a new type within your pull request, which 
  will be added to the `BaseProvider` class.

##### get columnMapping

`get columnMapping()` returns an object used for mapping values to the columns on the Omnibug overview screen. Right now, 
there are 2 types of columns that can be mapped:
  
  1. `account`, which is the account / client ID that is used by the provider.
  1. `requestType`, which is the type of request that is sent to the provider. This is what shows in the badges in the 
  Omnibug overview screen. Page view requests should match the words "page view"


##### get groups

`get groups()` should return an array of objects that describe the groups shown within the Omnibug interface for this provider.
```json
[
  {
    "key": "products",
    "name": "Products"
  },
  {
    "key": "page",
    "name": "Page Data"
  }
]
```

Any parameter that does not have a group set will be displayed under the `Other` group.

##### get keys

`get keys()` returns an object used for to map raw parameter keys to friendly names and groupings. The `name` is the 
friendly version of the parameter's name (used for the `field` property), and the group should be the ID for the group 
you want the parameter to be in (_see: [get groups()](#get-groups)_).

```json
{ 
  "foo": {
    "name": "The foobar value",
    "group": "page"
  },
  "pids": {
    "name": "Products Displayed",
    "group": "products"
  }
} 
```

##### parseUrl

`parseUrl(rawUrl, postData = "")` will parse the URL (and POST data, if applicable) and return a friendly JSON object that 
is then used to display the request in the Omnibug interface. For a majority of providers, you will not need to override 
this method and it can be omitted from your provider's class.

##### parsePostData

`parsePostData(postData = "")` will take any POST data that is sent to the provider and parse it out into an array of 
key / value pairs to be parsed. If your provider is not sending any POST data, or the POST data is either a flat JSON object 
or sent as a form-data style (`key=value&key2=value2`), you do not need to override this method. 

However, if your provider is sending another format or you want better control over the parameters that are returned, 
you can override this method. Your method should return an array of key/value arrays, e.g.:

```json
[
  ["key1", "value1"],
  ["key2", "value2"],
  ["key3", "value3"]
]
```

##### handleQueryParam

`handleQueryParam(name, value)` parses each parameter key and value (from either the URL or parsed POST data), and 
returns the human-readable object. By default, `handleQueryParam` will check if `name` is within the object returned 
by the `get keys()` method. If it is, then the value is assigned and the parameter object is returned. If it is not, 
then it will show up under the `Other` group with the raw parameter key shown as the name.

There are times that you may want to override this method. You might have a set of parameters that match a 
certain naming schema but there are a lot of them and it doesn't make sense to list them all out. For example, your 
provider has custom dimensions that are passed in the `cd1`, `cd2`, `cd3`, etc. format. Instead of listing each of those 
possibilities out in the `get keys()` method, you could add logic here to see if the name matches your format and then 
return an object with a dynamically generated name.

It is recommended that you still call the inherited method for when the parameters do not match your logic. 

Using the custom dimension example above, here is a code sample of what you might have:
```javascript
handleQueryParam(name, value) 
{
  let result = {};
  
  // Check if the parameter name/key matches our format (cd1, cd2, etc.)
  if(/^cd(\d+)$/.test(name)) 
  {
    // The parameter matches our format, so let's dynamically create the field name
    result = {
      "key": name,
      "field": "Custom Dimension " + RegExp.$1,
      "value": value,
      "group": "dimensions"
    };
  }
  else
  {
    // It does not match, so be sure to call the parent method!
    result = super.handleQueryParam(name, value);
  }
  return result;
}
```

It is important to note that you should only return _one_ parameter at a time from this. 

##### handleCustom

`handleCustom(url, params)` allows you to add additional parameters based off the URL or previously identified parameters. 
For example, the Account ID for a provider might exist as the sub-domain, but is not populated in any other place. You 
should return an array of [parameter objects](#parameter-syntax). 

Note that the `url` argument is a [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) and the `params` 
argument is a [URLSearchParams object](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) that contains all 
of the URL parameters, plus the parameters from any parsed POST data.

Below is an example of grabbing the account ID from the sub-domain and returning it via the `handleCustom` method:

```javascript
handleCustom(url, params)
{
  let hostname =  url.hostname.split('.'),
      result = {
        "key": "accountID",
        "field": "Account ID",
        "group": "general",
        "value": hostname[0]
      };
  
  return [result];
}
```

#### Adding a Test Suite

All providers should have a test suite included with their pull request. The following items to test are recommended:

* The provider's `key`, `type`, `name`, and `pattern` are properly set
* Verify that the `pattern` works
  * Check a handful of URLs to ensure that they _do_ match
  * Use bogus URLs to verify that it is not greedy
  * Ensure that OmnibugProvider returns your provider for one or more of the test URLs
* Check to verify your provider returns any data
* Check for properly parsed POST data
* Check for any dynamic parameters
  * As set in the `handleQueryParam` method
  * And as set in the `handleCustom` method


### Testing

Testing is done via [AVA](https://github.com/avajs/ava) and can be executed by running the following command:
```
$ yarn run test
```

This will run the build process to build the providers and core Omnibug classes, and then show the result of the test suite.
Any pull requests or pushes to the repository will trigger [Travis CI](https://travis-ci.org/MisterPhilip/omnibug/) and 
[Coveralls](https://coveralls.io/github/MisterPhilip/omnibug) to verify that all tests are passing and Omnibug has good 
test coverage across the providers and core classes.

### Building

Since each browser requires slightly different manifests & some need polyfills, [Grunt](https://gruntjs.com/) takes care 
of building browser-specific code from the generic code base. To build for all browsers:
```
$ yarn run build
```

This will output to the `/platform/$BROWSER` folders, as well as output a `.zip` for distribution in the `/build/$BROWSER` folders.


### Getting Help

If you get stuck or this documentation isn't clear, there are multiple ways to get help:

* The [Omnibug Discord group](http://omnibug.io/discord)
* [Github issues](https://github.com/MisterPhilip/omnibug/issues) with a "question" tag
* Tweeting [@Omnibug](https://twitter.com/omnibug) with your question(s)