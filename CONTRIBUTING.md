Contributing to Omnibug
==========

Omnibug is a browser plugin to ease developing & maintaining web metrics implementations. Each outgoing request
(sent by the browser) is checked for a pattern; if a match occurs, the URL is displayed in a panel, and decoded to show
the details of the request

### Issues
Find an issue? That's not good! Here's a list of information that we needed when opening a Github issue:

 * The browser name & version
 * OS name & version
 * Version of Omnibug you're running (clicking on "More" next to Omnibug in Firefox will show this)
 * The issue you're having
 * A way to replicate it (ideally a page we can access)

### Installing locally

To do any work, fork the original repository, and clone it locally. Then, install via [NPM](https://www.npmjs.com/):
```
$ npm install
```

##### Chrome
To install the local version in Chrome, go to the [chrome://extensions/](Extensions) settings, then be sure "Developer Mode" 
is checked. Once developer mode is enabled, select "Load unpacked extension..." and point to the `/platform/chromium/manifest.json` 
file. Learn more at [Google's docs](https://developer.chrome.com/extensions/getstarted).

##### Firefox
To install the local version in Firefox, go to the [about:addons](Add-ons Manager), then click the settings/gear icon. 
From there, select "[Debug Add-ons](about:debugging#addons)", and then select "Load Temporary Add-on" and point to the `/platform/firefox/manifest.json` 
file. Learn more at [Mozilla's docs](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).

##### Edge
Edge is currently not supported, due to missing APIs. Maybe one day, sigh...

### Coding Styles

@TODO

### Adding a Provider

@TODO

When adding a provider, be sure to add a unit test that covers a wide range of use cases.

### Testing

Testing is done via [AVA](https://github.com/avajs/ava) and can be executed by running the following command:
```
$ npm run test
```

### Building

Since each browser requires slightly different manifests & some need polyfills, [Grunt](https://gruntjs.com/) takes care 
of building browser-specific code from the generic code base. To build for all browsers:
```
$ grunt build-extensions
```

You can also specify what browser to build for (`chrome`, `firefox`, or `edge`):
```
$ grunt build-extensions chrome
```

This will output to the `/platform/$BROWSER` folders, as well as output a `.zip` for distribution in the `/build/$BROWSER` folders.