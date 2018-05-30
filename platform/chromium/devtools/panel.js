(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("webextension-polyfill", ["module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.browser = mod.exports;
  }
})(this, function (module) {
  /* webextension-polyfill - v0.2.1 - Sun Nov 19 2017 02:44:45 */
  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */
  /* vim: set sts=2 sw=2 et tw=80: */
  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined") {
    // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.
    const wrapAPIs = () => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "export": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "import": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            }
          }
        },
        "downloads": {
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getBrowserInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }

      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */
      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }
      }

      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */
      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };

      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.rejection
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function}
       *        The generated callback function.
       */
      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (chrome.runtime.lastError) {
            promise.reject(chrome.runtime.lastError);
          } else if (metadata.singleCallbackArg || callbackArgs.length === 1) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */
      const wrapAsyncFunction = (name, metadata) => {
        const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";

        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            target[name](...args, makeCallback({ resolve, reject }, metadata));
          });
        };
      };

      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the orginal method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */
      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }
        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);

      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */
      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);

        let handlers = {
          has(target, prop) {
            return prop in target || prop in cache;
          },

          get(target, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.

              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,
                get() {
                  return target[prop];
                },
                set(value) {
                  target[prop] = value;
                }
              });

              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(target, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }
            return true;
          },

          defineProperty(target, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(target, prop) {
            return Reflect.deleteProperty(cache, prop);
          }
        };

        return new Proxy(target, handlers);
      };

      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */
      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }
      });

      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }

        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */
        return function onMessage(message, sender, sendResponse) {
          let result = listener(message, sender);

          if (isThenable(result)) {
            result.then(sendResponse, error => {
              console.error(error);
              sendResponse(error);
            });

            return true;
          } else if (result !== undefined) {
            sendResponse(result);
          }
        };
      });

      const staticWrappers = {
        runtime: {
          onMessage: wrapEvent(onMessageWrappers)
        }
      };

      // Create a new empty object and copy the properties of the original chrome object
      // to prevent a Proxy violation exception for the devtools API getter
      // (which is a read-only non-configurable property on the original target).
      const targetObject = Object.assign({}, chrome);

      return wrapObject(targetObject, staticWrappers, apiMetadata);
    };

    // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.
    module.exports = wrapAPIs(); // eslint-disable-line no-undef
  } else {
    module.exports = browser; // eslint-disable-line no-undef
  }
});
//# sourceMappingURL=browser-polyfill.js.map

/*
 * Omnibug
 * DevTools panel code (view)
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
 * a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041,
 * USA.
 *
 */


window.Omnibug = (() => {

    let d = document,
        settings = (new OmnibugSettings).defaults,
        requestPanel = d.getElementById("requests"),
        noRequests = d.getElementById("no-requests"),
        filters = {"providers": {}, "account": "", "accountType": "contains"},
        persist = true,
        recordedData = [],
        allProviders = OmnibugProvider.getProviders();

    // Clear all requests
    d.querySelectorAll("a[href=\"#clear\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            clearRequests();
        })
    });

    // Open settings from links in devtools
    d.querySelectorAll("a[href=\"#settings\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            browser.runtime.openOptionsPage();
        })
    });

    // Open modals
    d.querySelectorAll("button[data-target-modal], a[data-target-modal]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = d.getElementById(element.getAttribute("data-target-modal"));
            if(target) {
                target.classList.add("active");
            }
        })
    });

    // Close modals
    d.querySelectorAll(".modal a[href=\"#close\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = element.closest(".modal");
            if(target) {
                target.classList.remove("active");
            }
        })
    });

    // Add our listener for the account filter
    let filterAccount = d.getElementById("filter-account"),
        filterAccountType = d.getElementById("filter-account-type");
    filterAccount.addEventListener("input", (event) => {
        // event.preventDefault();
        let accountFilter = event.target.value;
        filters.account = accountFilter.replace(/[^0-9a-zA-Z_ .,-]/g, "");
        updateFiltersStyles();
    });
    filterAccountType.addEventListener("change", (event) => {
        // event.preventDefault();
        let accountFilterType = event.target.value;
        filters.accountType = ["contains", "starts", "ends", "exact"].indexOf(accountFilterType) === -1 ? "contains" : accountFilterType;
        updateFiltersStyles();
    });
    filterAccount.addEventListener("keypress", (event) => {
        let key = event.which || event.keyCode;
        if(key === 13) {
            d.getElementById("filter-modal").classList.remove("active");
        }
    });

    // Add our filter
    d.getElementById("provider-search").addEventListener("input", (event) => {
        let searchTerm = (event.target.value || "").toLowerCase(),
            providers = d.querySelectorAll("#filter-providers > li");

        providers.forEach((provider) => {
            let name = provider.getAttribute("data-provider") || "";
            if(name.toLowerCase().indexOf(searchTerm) >= 0)
            {
                provider.setAttribute("style", "display:block;");
            }
            else
            {
                provider.setAttribute("style", "display:none;");
            }
        });
    });

    // Clear requests on navigation
    d.getElementById("persist-enable").addEventListener("click", (event) => {
        event.preventDefault();
        d.body.classList.remove("persist-disabled");
        persist = true;
    });

    // Persist requests on navigation
    d.getElementById("persist-disable").addEventListener("click", (event) => {
        event.preventDefault();
        d.body.classList.add("persist-disabled");
        persist = false;
    });

    // Export to CSV/Tab files
    d.getElementById("export-form").addEventListener("submit", (event) => {
        event.preventDefault();
        let formData = new FormData(event.target),
            filename = (formData.get("filename") || "").replace(/[^0-9a-zA-Z_ .,-]/g, ""),
            useFilters = Boolean(formData.get("useFilters")),
            showNavigation = Boolean(formData.get("showNavigation")),
            fileType = formData.get("fileType") || "",
            exportData = recordedData;

        // filter out what is needed
        if(!showNavigation) {
            exportData = exportData.filter((request) => {
                return request.event !== "webNavigation";
            })
        }
        if(useFilters) {
           exportData = exportData.filter((request) => {
               if(request.event === "webNavigation") { return true; }
               let account = getMappedColumnValue("account", request);
               return filters.providers[request.provider.key] === true
                   && ((!filters.account && !account) || (account && account.indexOf(filters.account) !== -1));
           });
        }

        // Check our file type to make sure we're OK
        if(["csv", "tab"].indexOf(fileType) === -1) {
            fileType = "csv";
        }

        // generate a filename if one was not passed or contained too many bad chars
        if(filename === "") {
            let now = new Date(),
                date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((e) => e.toString().length === 1 ? "0" + e : e),
                time = [now.getHours(), now.getMinutes() + 1, now.getSeconds()].map((e) => e.toString().length === 1 ? "0" + e : e);
            filename = `Omnibug_Export_${date.join("-")}_ ${time.join("-")}`;
        }

        // Append our file extension
        filename += `.${fileType}`;

        // Start the export process
        let colDelim = (fileType === "csv") ? `","` : `"\t"`,
            exportText = exportData.map((request) => {
                let row = [];
                if(request.event === "webNavigation") {
                    row = [
                        "Navigation",
                        "",
                        "",
                        ""
                    ];
                } else {
                    console.log(request);
                    let account = getMappedColumnValue("account", request),
                        requestType = getMappedColumnValue("requestType", request);

                    row = [
                        requestType,
                        request.provider.name,
                        account,
                        request.request.id
                    ];
                }
                row.push(request.request.url.replace(/"/g, `\\"`));
                row.push(request.request.postData);
                row.push((new Date(request.request.timestamp)).toString());
                if(settings.showNotes) {
                    row.push(request.request.note);
                }
                return `"` + row.join(colDelim) + `"`;
            }).join("\n");
        // Add any headers
        exportText = `"` + ["Omnibug v0.6.0", "Exported " + (new Date()).toString()].join(colDelim) + `"\n`
                   + `"` + ["Event Type", "Provider", "Account", "Request ID", "Request URL", "POST Data", "Timestamp", "Notes"].join(colDelim) + `"\n` + exportText;


        // Generate the file to download
        let link = d.createElement("a"),
            blob = new Blob([exportText], {type: `text/${fileType}`}),
            url = window.URL.createObjectURL(blob);
        d.body.appendChild(link);
        link.href = url;
        link.download = filename;

        // Force the download
        link.click();
        window.URL.revokeObjectURL(url);

        // Clean up
        link.remove();

        // Close the modal overlay now that they've exported the file
        let modal = event.target.closest(".modal");
        if(modal) {
            modal.classList.remove("active");
        }
    });


    // Setup our providers in our filters list
    Object.keys(OmnibugProvider.getProviders()).forEach((key) => {
        filters.providers[key] = true;
    });

    // Load up the default settings
    loadSettings(settings);

    /**
     * Listener for note changes
     * @param event
     */
    function noteListener(event) {
        let input = event.target,
            requestParent = input.closest("details.request"),
            id = requestParent.getAttribute("data-request-id"),
            timestamp = requestParent.getAttribute("data-timestamp"),
            index = recordedData.findIndex((request) => {
                console.log("recordedData", request);
                return request.event === "webRequest" && String(request.request.id) === id && String(request.request.timestamp) === timestamp;
            });
        console.log("noteListener", id, timestamp, index, input.value);
        if(index !== -1) {
            // this _should_ always be true...
            recordedData[index].request.note = input.value;
        }
    }

    /**
     * Shortcut to creating an HTML element
     *
     * @param type          String
     * @param classList     []
     * @param attributes    []
     * @return {HTMLElement}
     */
    function createElement(type, classList = [], attributes = {}) {
        let element = d.createElement(type);
        if(classList.length) {
            element.classList.add(...classList);
        }
        Object.entries(attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
        return element;
    }

    function clearRequests( ) {
        // Clear our current requests
        clearChildren(requestPanel);

        // Show the no requests found notification
        noRequests.classList.remove("d-none");

        recordedData = [];
    }

    /**
     * Add a new provider-based request
     *
     * @param request
     */
    function addRequest(request) {
        noRequests.classList.add("d-none");
        recordedData.push(request);
        requestPanel.appendChild(buildRequest(request));
    }

    /**
     * Add a redirected class for all requests that share the same ID
     *
     * @param requestId
     */
    function updateRedirectedEntries(requestId) {
        let redirectedEntries = d.querySelectorAll(`.request[data-request-id="${requestId}"]`);
        redirectedEntries.forEach((entry) => {
            entry.classList.add("redirected");
        });
    }

    /**
     * Get a mapped column value
     *
     * @param column
     * @param request
     * @return {string}
     */
    function getMappedColumnValue(column, request) {
        let value = "";
        if(request.provider && request.provider.columns && request.provider.columns[column]) {
            value = request.data.find((el) => {
                return el.key === request.provider.columns[column];
            });
            if(value) {
                value = value.value;
            }
        }
        return value;
    }

    /**
     * Build HTML for a request
     *
     * @param request
     * @return {HTMLElement}
     */
    function buildRequest(request) {
        let details = createElement("details", ["request"], {
                        "data-request-id": request.request.id,
                        "data-provider": request.provider.key,
                        "data-timestamp": request.request.timestamp,
                        "data-account": ""
                      }),
            summary = createElement("summary"),
            body = createElement("div");

        // Update any redirected entries
        updateRedirectedEntries(request.request.id);

        // Setup parent details element
        if(settings.alwaysExpand) {
            details.setAttribute("open", "open");
        }

        // Add the summary (title)
        let summaryContainer = createElement("div", ["container"]),
            summaryColumns = createElement("div", ["columns"]),
            colTitleWrapper = createElement("div", ["column", "col-3", "col-lg-4", "col-md-4", "col-sm-5"]),
            colTitleSpan = createElement("span"),
            colTitleRedirect = createElement("small", ["redirect", "redirect-icon"], {"title": "This entry was redirected."}),
            colTitleRedirectIcon = createElement("i", ["fas", "fa-sync"]),
            colAccount = createElement("div", ["column", "col-3", "col-lg-4", "col-md-4", "col-sm-5"]),
            colTime = createElement("div", ["column", "col-6", "col-lg-4", "col-md-4", "col-sm-2"]),
            providerTitle = request.provider.name;

        // Add the provider name & request type (if applicable)
        if(request.provider.columns.requestType) {
            let requestTypeEl = createElement("span", ["label"]),
                requestTypeValue = request.data.find((el) => {
                    return el.key === request.provider.columns.requestType;
                });

            // Verify the column / data exists, if so add it as a label
            if(requestTypeValue) {
                requestTypeEl.setAttribute("data-request-type", requestTypeValue.value);
                requestTypeEl.innerText = requestTypeValue.value;
                colTitleWrapper.appendChild(requestTypeEl);
                providerTitle += " - " + requestTypeValue.value;
            }
        }
        colTitleSpan.innerText = request.provider.name;
        colTitleWrapper.setAttribute("title", providerTitle);
        colTitleRedirect.appendChild(colTitleRedirectIcon);
        colTitleWrapper.appendChild(colTitleSpan);
        colTitleWrapper.appendChild(colTitleRedirect);
        summaryColumns.appendChild(colTitleWrapper);

        // Add the account ID, if it exists
        let accountValue = getMappedColumnValue("account", request);

        if(accountValue) {
            colAccount.innerText = accountValue;
            colAccount.setAttribute("title", accountValue);
            details.setAttribute("data-account", accountValue);
        }
        summaryColumns.appendChild(colAccount);

        // Add the timestamp
        let timestamp = new Date(request.request.timestamp);
        colTime.innerText = timestamp;
        colTime.setAttribute("title", timestamp);
        summaryColumns.appendChild(colTime);

        // Append our summary
        summaryContainer.appendChild(summaryColumns);
        summary.appendChild(summaryContainer);
        details.appendChild(summary);

        let redirectWarning = createElement("div", ["redirect", "toast", "toast-warning"]);
        redirectWarning.innerText = "This request was redirected, thus the data may not be the final data sent to the provider.";
        body.appendChild(redirectWarning);

        let noteWrapper = createElement("div", ["form-group", "request-note"]),
            noteInput = createElement("input", ["form-input"], {"type": "text", "placeholder": "Enter a note about this request&hellip;"});
        noteInput.addEventListener("input", noteListener);
        noteWrapper.appendChild(noteInput);
        body.appendChild(noteWrapper);

        let requestSummary = [];
        Object.entries(request.request).forEach((info) => {
            requestSummary.push({
                "key": "omnibug-" + info[0],
                "field": info[0],
                "value": info[1]
            });
        });

        let data = request.data.reduce((groups, item) => {
            if(!item.hidden) {
                const val = item.group;
                groups[val] = groups[val] || [];
                groups[val].push(item);
            }
            return groups;
        }, {"Summary": requestSummary});

        Object.entries(data).forEach((dataGroup) => {
            let panel = buildRequestPanel(dataGroup[0], dataGroup[1], !settings.showFullNames);
            body.appendChild(panel);
        });
        details.appendChild(body);

        return details;
    }

    /**
     * Build the HTML for a request panel
     *
     * @param title string
     * @param data  []
     * @param useKey Boolean
     * @return {HTMLElement}
     */
    function buildRequestPanel(title, data = [], useKey = false) {
        let wrapper = createElement("details", ["request-details"], {"open": "open"});

        // Add the summary (title)
        let summary = createElement("summary");
        summary.innerText = title;
        wrapper.appendChild(summary);

        // Setup the table
        let table = createElement("table", ["table", "table-striped", "table-hover"]),
            tableBody = createElement("tbody");

        // Loop through each of the data objects to create a new table row
        data.sort((a, b) => {
            let aKey = a.field.toLowerCase(),
                bKey = b.field.toLowerCase();
            return aKey.localeCompare(bKey, "standard", {"numeric": true});
        }).forEach((row) => {
            let tableRow = createElement("tr", [], {"data-parameter-key": row.key}),
                title = `${row.field} (${row.key})`,
                name = createElement("td", [], {"title": title}),
                nameKey = createElement("span", ["parameter-key"]),
                nameField = createElement("span", ["parameter-field"]),
                value = createElement("td", ["parameter-value"]);

            nameKey.innerText = row.key;
            nameField.innerText = row.field;
            value.innerText = row.value;

            name.appendChild(nameKey,);
            name.appendChild(nameField);

            tableRow.appendChild(name);
            tableRow.appendChild(value);
            tableBody.appendChild(tableRow);
        });

        // Append the final results
        table.appendChild(tableBody);
        wrapper.appendChild(table);

        return wrapper;
    }

    /**
     * Add a navigation event to the panel
     *
     * @param navigation
     */
    function addNavigation(navigation) {
        let request = createElement("div", ["navigation", "noselect"]);
        request.innerText = "Navigated to " + navigation.request.url;

        // check if we need to clear any existing requests out first...
        if(!persist) {
            clearRequests();
        }

        // Add it to our data array
        recordedData.push(navigation);

        requestPanel.appendChild(request);
    }

    /**
     * Load in new settings/styles
     *
     * @param newSettings
     */
    function loadSettings(newSettings) {
        let styleSheet = d.getElementById("settingsStyles");

        settings = newSettings;

        // Build the filter list
        buildProviderFilterPanel();

        // Clear out any existing rules
        clearStyles(styleSheet);

        // Highlight colors
        if(settings.highlightKeys.length) {
            let highlightPrefix = "[data-parameter-key=\"",
                highlightKeys = highlightPrefix + settings.highlightKeys.join(`"], ${highlightPrefix}`) + "\"]",
                rule = `${highlightKeys} { background-color: ${settings.color_highlight} !important; }`;
            styleSheet.sheet.insertRule(rule);
        }

        // Wrap text or truncate with ellipsis
        if(!settings.wrapText) {
            styleSheet.sheet.insertRule(`.parameter-value {white-space: nowrap; overflow: hidden;  text-overflow: ellipsis;}`, styleSheet.sheet.cssRules.length);
            styleSheet.sheet.insertRule(`.parameter-value:hover {white-space: normal; overflow: visible;  height:auto;}`, styleSheet.sheet.cssRules.length);
        }

        // Hide note field if disabled
        if(!settings.showNotes) {
            styleSheet.sheet.insertRule(`.request-note {display: none;}`, styleSheet.sheet.cssRules.length);
        }

        // Background colors
        styleSheet.sheet.insertRule(`[data-request-type] { background-color: ${settings.color_click}; }`, styleSheet.sheet.cssRules.length);
        styleSheet.sheet.insertRule(`[data-request-type="Page View"] { background-color: ${settings.color_load}; }`, styleSheet.sheet.cssRules.length);
        styleSheet.sheet.insertRule(`details.request.redirected [data-request-type] { background-color: ${settings.color_redirect}; }`, styleSheet.sheet.cssRules.length);
        styleSheet.sheet.insertRule(`[data-request-type="previous"] { background-color: ${settings.color_prev}; }`, styleSheet.sheet.cssRules.length);
        styleSheet.sheet.insertRule(`request:hover > summary { background-color: ${settings.color_hover}; }`, styleSheet.sheet.cssRules.length);

        // Key vs. name
        if(settings.showFullNames) {
            styleSheet.sheet.insertRule(`.parameter-key { display: none; }`, styleSheet.sheet.cssRules.length);
        } else {
            styleSheet.sheet.insertRule(`.parameter-field { display: none; }`, styleSheet.sheet.cssRules.length);
        }

        // Navigation requests
        if(!settings.showNavigation) {
            styleSheet.sheet.insertRule(`.navigation { display: none; }`, styleSheet.sheet.cssRules.length);
        }

        // Redirected requests
        if(!settings.showRedirects) {
            styleSheet.sheet.insertRule(`details.request.redirected:not([open]) { display: none; }`, styleSheet.sheet.cssRules.length);
        }

        // Quotes
        if(settings.showQuotes) {
            styleSheet.sheet.insertRule(`.parameter-value:before, .parameter-value:after { content: '"'; color: ${settings.color_quotes}; }`, styleSheet.sheet.cssRules.length);
        }
    }

    /**
     * Build the provider filter panel
     */
    function buildProviderFilterPanel() {
        let providerList = d.getElementById("filter-providers");

        // Clear any existing providers
        clearChildren(providerList);

        // Create an entry for _all_ of our providers
        for(let providerKey in allProviders) {
            if(!allProviders.hasOwnProperty(providerKey)) { continue; }

            // Create our DOM elements
            let wrapper = createElement("li", [], {"data-provider": providerKey}),
                input = createElement("input", [], {"type": "checkbox", "id": `filter-provider-${providerKey}`}),
                label = createElement("label", ["noselect"], {"for": `filter-provider-${providerKey}`}),
                span = createElement("span");

            // Check if the user has the provider enabled or not
            if(settings.enabledProviders.indexOf(providerKey) === -1) {
                input.setAttribute("disabled", "disabled");
                label.classList.add("disabled");
                label.setAttribute("title", "This provider is currently disabled and requests for this provider will never be shown. You can re-enable it within the settings");
            } else {
                if(filters.providers[providerKey]) {
                    input.setAttribute("checked", "checked");
                }
            }

            // Set our values and setup the DOM structure
            span.innerText = allProviders[providerKey].name;
            input.value = providerKey;
            label.appendChild(input);
            label.appendChild(span);
            wrapper.appendChild(label);
            providerList.appendChild(wrapper);

            // Add our event listener
            input.addEventListener("change", (event) => {
                let checkbox = event.target,
                    providerKey = checkbox.value;
                filters.providers[providerKey] = checkbox.checked;
                updateFiltersStyles();
            });

            filters.providers[providerKey] = input.checked;
        }

        // Finally, update our stylesheet with the new filters
        updateFiltersStyles();
    }

    /**
     * Update the filters stylesheet
     */
    function updateFiltersStyles() {
        let styleSheet = d.getElementById("filterStyles");

        // Clear out any existing styles
        clearStyles(styleSheet);

        // Figure out what providers are hidden
        let hiddenProviders = Object.entries(filters.providers).filter((provider) => {
            return !provider[1] && (settings.enabledProviders.indexOf(provider[0]) > -1);
        }).map((provider) => {
            return `.request[data-provider="${provider[0]}"]`;
        });

        // Add hidden providers, if any
        if(hiddenProviders.length) {
            styleSheet.sheet.insertRule(`${hiddenProviders.join(", ")} { display: none; }`);
        }

        // Add account filter, if applicable
        if(filters.account) {
            let filterMap = {"contains": "*", "starts": "^", "ends": "$", "exact": ""};
            styleSheet.sheet.insertRule(`.request:not([data-account${filterMap[filters.accountType]}="${filters.account}" i]) { display: none; }`);
        }

        // Show the user that filters are (in)active
        if(filters.account || hiddenProviders.length) {
            d.body.classList.add("filters-active");
        } else {
            d.body.classList.remove("filters-active");
        }
    }

    /**
     * Removes all styles from a stylesheet
     *
     * @param styleSheet
     */
    function clearStyles(styleSheet) {
        while(styleSheet.sheet.cssRules.length) {
            styleSheet.sheet.removeRule(0);
        }
    }

    /**
     * Remove all the pesky children for an element
     *
     * @param element
     */
    function clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    return {
        /**
         * Receive a message from our eventPage file
         *
         * @param message
         */
        receive_message(message) {
            switch(message.event || "") {
                case "webRequest":
                    addRequest(message);
                break;
                case "webNavigation":
                    addNavigation(message);
                break;
                case "settings":
                    loadSettings(message.data);
                break;
                default:
                    this.send_message("Unknown message type", message);
                break;
            }
        },
        /**
         * Send a message back to the background script
         *
         * @param data
         */
        send_message(...data) {
            // do nothing, let the devtools.js update this method
        }
    };

})();