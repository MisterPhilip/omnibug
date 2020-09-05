/* globals OmnibugSettings, OmnibugProvider, OmnibugTracker, createElement, clearStyles, clearChildren, Fuse */
(function() {

    // Setup GA tracker
    let tracker = new OmnibugTracker(),
        providerSearch;

    /**
     * Setup a proxy handler to observe changes to the settings object
     *
     * @type {{set: function(*, *=, *=), get: function(*, *)}}
     */
    const settingsHandler = {
        /**
         * Set the new value
         *
         * @param target    Target object (settings)
         * @param prop      Property
         * @param value     New Value
         */
        set: (target, prop, value) => {
            console.log(`setting ${prop}`, value);
            target[prop] = value;
            if(prop === "highlightKeys")
            {
                // do something special with these
                let paramList = document.getElementById("highlight-params");

                clearChildren(paramList);
                value.forEach((param) => {
                    paramList.appendChild(createHighlightParam(param));
                });
            }
            else if(prop === "additionalSummary")
            {
                // do something special with these
                let paramList = document.getElementById("addSummary-params");

                clearChildren(paramList);
                value.forEach((param) => {
                    paramList.appendChild(createAdditionalSummaryParam(param));
                });
            }
            else if(prop === "renameParameters") {
                document.getElementById("renameParam").value = JSON.stringify(value);
            }
            else if(prop === "providers")
            {
                let inputs = document.querySelectorAll(`input[data-bind-property="providers-enabled"]`);
                inputs.forEach((input) => {
                    input.checked = (target["providers"][input.value].enabled);
                });
            }
            else if(prop === "providers-enabled") {
                return;
            }
            else
            {
                let inputs = document.querySelectorAll(`input[data-bind-property="${prop}"]`);
                if(typeof target[prop] === "object") {
                    inputs.forEach((input) => {
                        input.checked = (target[prop].indexOf(input.value) >= 0);
                    });
                } else {
                    if(inputs.length === 1)
                    {
                        let input = inputs[0];
                        if(input.type === "checkbox")
                        {
                            // Checkbox input
                            input.checked = !!value;
                        }
                        else if(input.type === "color")
                        {
                            // Color input
                            input.value = value;
                            let bindingStyle = input.getAttribute("data-bind-style") || "background-color";
                            input.nextElementSibling.setAttribute("style", `${bindingStyle}: ${value}`);
                        }
                        else
                        {
                            // Text input
                            input.value = value;
                        }
                    }
                    else if(inputs.length > 1)
                    {
                        // Radio input
                        inputs.forEach((input) => {
                            input.checked = (input.value === String(value));
                        });
                    }
                }
            }

            // Update any dynamic styles on the page
            updateDynamicStyles();
        },
        /**
         * Retrieve the current value
         *
         * @param target    Target object (settings)
         * @param prop      Property
         * @return {*}
         */
        get: (target, prop) => {
            return target[prop];
        }
    };

    let settingsObj = {},
        settings = new Proxy(settingsObj, settingsHandler),
        loadSettingsIntoProxy = (values) => {
            for(let setting in values)
            {
                if (Object.prototype.hasOwnProperty.call(values, setting)) {
                    settings[setting] = values[setting];
                }
            }
        };

    // Show all available providers
    let providers = OmnibugProvider.getProviders(),
        providerList = document.getElementById("providers-list"),
        groups = {};
    for(let provider in providers) {
        if (!Object.prototype.hasOwnProperty.call(providers, provider)) {
            continue;
        }
        groups[providers[provider].type] = groups[providers[provider].type] || [];
        groups[providers[provider].type].push(providers[provider]);
    }

    Object.keys(groups).sort().forEach((groupKey) => {
        let groupSummary = createElement("summary", {
                "text": groupKey
            }),
            groupDetails = createElement("details", {
                "children": [groupSummary]
            });
        groups[groupKey].forEach((provider) => {
            let input = createElement("input", {
                    "attributes": {
                        "type": "checkbox",
                        "data-bind-property": "providers-enabled",
                        "id": `provider-${provider.key}`,
                        "value": provider.key
                    }
                }),
                labelText = createElement("span", {
                    "text": provider.name
                }),
                label = createElement("label", {
                    "attributes": {
                        "style": "display:block;",
                        "data-provider": provider.key
                    },
                    "children": [input, labelText]
                });
            groupDetails.appendChild(label);
        });
        providerList.appendChild(groupDetails);
    });

    // Grab the default settings & load in the user's settings
    let settingsProvider = new OmnibugSettings();
    loadSettingsIntoProxy(settingsProvider.defaults);
    settingsProvider.load().then((loadedSettings) => {

        // Update the settings page with our loaded settings
        loadSettingsIntoProxy(loadedSettings);

        // Load GA script
        tracker.init(loadedSettings.allowTracking);
        tracker.track(["send", "pageview", "/settings"]);

        // Add listeners to all of the inputs for 2-way binding
        document.querySelectorAll("input[data-bind-property]").forEach((input) => {
            input.addEventListener("change", (event) => {
                let field = input.getAttribute("data-bind-property"),
                    type  = input.type,
                    value = input.value;

                // Validate the input attributes
                if ((field !== "providers-enabled" && !Object.prototype.hasOwnProperty.call(settings, field)) || !type) { return; }

                // Do some value manipulation as needed
                if(field === "providers-enabled") {
                    if(!input.checked && settings["providers"][value].enabled) {
                        settings["providers"][value].enabled = false;
                        tracker.track(["send", "event", "settings", "providers", `removed: ${value}`]);
                    } else if(input.checked && !settings["providers"][value].enabled) {
                        settings["providers"][value].enabled = true;
                        tracker.track(["send", "event", "settings", "providers", `added: ${value}`]);
                    }
                    field = "providers";
                    value = settings["providers"];
                } else if(type === "checkbox") {
                    value = input.checked;
                } else if(type === "color") {
                    if(!/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(value)) {
                        value = "#FFFFFF";
                    }
                }

                console.log("updating " + field);

                // Update the object (and thus update any other elements attached to the field) & save the settings
                settings[field] = value;
                settingsProvider.save(settingsObj);

                tracker.init(settings.allowTracking);

                if(field !== "providers" && field !== "highlightKeys" && field !== "additionalSummary") {
                    tracker.track(["send", "event", "settings", field, String(value)], (field === "allowTracking"));
                }
            });
        });
    });

    if(!OmnibugTracker.browserTrackingEnabled) {
        document.getElementById("trackerWrapper").classList.add("d-none");
    }

    document.getElementById("addParam").addEventListener("change", (event) => {
        event.preventDefault();

        let newParam = event.target.value,
            paramList = document.getElementById("highlight-params");

        if(newParam.trim() !== "" && !settings.highlightKeys.filter((key) => {
            return key.toLowerCase() === newParam.toLowerCase();
        }).length) {
            paramList.appendChild(createHighlightParam(newParam));

            settings.highlightKeys.push(newParam);
            settingsProvider.save(settingsObj);

            tracker.track(["send", "event", "settings", "highlightKeys", `added: ${newParam}`]);
        }

        event.target.value = "";
    });

    document.getElementById("addSummary").addEventListener("change", (event) => {
        event.preventDefault();

        let newParam = event.target.value,
            paramList = document.getElementById("addSummary-params");

        if(paramList.childElementCount < 3) {
            if(newParam.trim() !== "" && settings.additionalSummary.indexOf(newParam) === -1) {
                paramList.appendChild(createAdditionalSummaryParam(newParam));

                settings.additionalSummary.push(newParam);
                settingsProvider.save(settingsObj);

                tracker.track(["send", "event", "settings", "additionalSummary", `added: ${newParam}`]);
                document.getElementById("addSummaryStatus").innerHTML = "";
            }
        } else {
            document.getElementById("addSummaryStatus").innerHTML = "You may only specify up to 3 parameters.";
        }

        event.target.value = "";
    });
    
    document.getElementById("renameParam").addEventListener("focus", (event) => {
        document.getElementById("renameParamStatus").innerHTML = "";
    });

    document.getElementById("renameParam").addEventListener("blur", (event) => {
        event.preventDefault();

        let stringParams = event.target.value.trim();
        let jsonParams = {},
            parsedOK = false;
        

        try {
            jsonParams = JSON.parse(stringParams);
            parsedOK = true;
        } catch(error) {
            if(stringParams.length === 0) {
                parsedOK = true;
                jsonParams = {};
            } else {
                document.getElementById("renameParamStatus").innerHTML = "Invalid JSON provided, data is not saved.";
                return;
            }
        }

        if( parsedOK ) {
            settings.renameParameters = jsonParams;
            settingsProvider.save(settingsObj);
            document.getElementById("renameParamStatus").innerHTML = "Saved";
            
            tracker.track(["send", "event", "settings", "renameParameter"]);
        }
    });


    console.log("search providers:", Object.values(providers));
    providerSearch = new Fuse(Object.values(providers), {
        findAllMatches: true,
        threshold: 0.3,
        location: 0,
        distance: 50,
        maxPatternLength: 20,
        minMatchCharLength: 1,
        includeScore: true,
        includeMatches: true,
        keys: [
            {
                name: "name",
                weight: 0.50
            },
            {
                name: "keywords",
                weight: 0.30
            },
            {
                name: "type",
                weight: 0.20
            }
        ]
    });
    document.getElementById("provider-search").addEventListener("input", (event) => {
        console.log("provider-search", event.target.value);
        let searchTerm = (event.target.value || "").substring(0, 20),
            providersList = document.getElementById("providers-list"),
            providerDetails = document.querySelectorAll("#providers-list > details"),
            providers = document.querySelectorAll("#providers-list label[data-provider]");

        if(searchTerm) {
            providersList.classList.add("searching");
            let results = providerSearch.search(searchTerm);
            console.log("search results:", results);

            providers.forEach((provider) => {
                if(results.find((searchProvider) => {
                    return searchProvider.item.key === provider.getAttribute("data-provider");
                }) !== undefined) {
                    provider.setAttribute("style", "display:block;");
                }
                else
                {
                    provider.setAttribute("style", "display:none;");
                }
            });

            providerDetails.forEach((element) => {
                element.open = true;
            });
        } else {
            providersList.classList.remove("searching");
            providers.forEach((provider) => {
                provider.setAttribute("style", "display:block;");
            });
        }
    });

    document.getElementById("reset-defaults").addEventListener("click", (event) => {
        event.preventDefault();
        let defaults = settingsProvider.defaults;
        loadSettingsIntoProxy(defaults);
        settingsProvider.save(defaults);

        if(settings.allowTracking) {
            tracker.track(["send", "event", "settings", "reset"]);
        }
    });

    function createHighlightParam(param) {
        let text = createElement("span", {
                "text": param
            }),
            remove = createElement("span", {
                "classes": ["remove"],
                "attributes": {
                    "title": "Remove",
                    "aria-label": "Remove"
                },
                "text": "\u00D7"
            }),
            li = createElement("li", {
                "children": [text, remove]
            });

        remove.addEventListener("click", (event) => {
            event.preventDefault();
            settings.highlightKeys = settingsObj.highlightKeys = settingsObj.highlightKeys.filter(item => item !== param);
            settingsProvider.save(settingsObj);
            tracker.track(["send", "event", "settings", "highlightKeys", `removed: ${param}`]);
        });

        return li;
    }

    function createAdditionalSummaryParam(param) {
        let text = createElement("span", {
                "text": param
            }),
            remove = createElement("span", {
                "classes": ["remove"],
                "attributes": {
                    "title": "Remove",
                    "aria-label": "Remove"
                },
                "text": "\u00D7"
            }),
            li = createElement("li", {
                "children": [text, remove]
            });

        remove.addEventListener("click", (event) => {
            event.preventDefault();
            settings.additionalSummary = settingsObj.additionalSummary = settingsObj.additionalSummary.filter(item => item !== param);
            settingsProvider.save(settingsObj);
            tracker.track(["send", "event", "settings", "additionalSummary", `removed: ${param}`]);
        });

        return li;
    }
    /**
     * Load in new settings/styles
     */
    function updateDynamicStyles() {
        let styleSheet = document.getElementById("settingsStyles");

        // Clear out any existing rules
        clearStyles(styleSheet);

        // Add any rules
        styleSheet.sheet.insertRule(`#highlight-params > li { background-color: ${settings.color_highlight} !important; }`, styleSheet.sheet.cssRules.length);
    }
}());
