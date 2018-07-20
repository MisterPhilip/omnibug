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
        storageLoadedSettings = false,
        recordedData = [],
        allProviders = OmnibugProvider.getProviders();

    // Setup GA tracker
    window.GoogleAnalyticsObject = "tracker";
    window.tracker = function(){ (window.tracker.q = window.tracker.q||[]).push(arguments), window.tracker.l=1*new Date(); };

    tracker("create", "##OMNIBUG_UA_ACCOUNT##", "auto");
    tracker("set", "checkProtocolTask", ()=>{});
    tracker("set", "dimension1", "##OMNIBUG_VERSION##");


    // Clear all requests
    d.querySelectorAll("a[href=\"#clear\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();
            clearRequests();
        })
    });


    // Open settings from links in devtools
    d.querySelectorAll("a[href=\"#settings\"]").forEach((element) => {
        if(!chrome || !chrome.runtime || !chrome.runtime.openOptionsPage) {
            element.classList.add("d-none");
        } else {
            element.addEventListener("click", (event) => {
                event.preventDefault();
                chrome.runtime.openOptionsPage();
            });
        }
    });

    // Open modals
    d.querySelectorAll("button[data-target-modal], a[data-target-modal]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = d.getElementById(element.getAttribute("data-target-modal"));
            if(target) {
                target.classList.add("active");
                track(["send", "event", "modal", "open", element.getAttribute("data-target-modal").replace(/^#/, '')]);
            }
        })
    });

    // Close modals
    d.querySelectorAll(".modal a[href=\"#close\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            let target = element.closest(".modal"),
                modal = target.getAttribute("id");
            if(target) {
                target.classList.remove("active");
                if(modal === "filter-modal") {
                    let hiddenProviders = Object.entries(filters.providers).filter((provider) => {
                        return !provider[1] && settings.disabledProviders.includes(provider[0]);
                    });
                    track(["send", "event", "filter requests", "account", (filters.account === "") ? "no filter" : filters.accountType]);
                    track(["send", "event", "filter requests", "hidden providers", hiddenProviders.length]);
                }
                track(["send", "event", "modal", "close", modal]);
            }
        })
    });

    // Add tracking to top nav
    d.querySelectorAll("header > nav a").forEach((element) => {
        element.addEventListener("click", (event) => {
            track(["send", "event", "top nav", element.getAttribute("href").replace("#", "")]);
        });
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

    // Select all/none
    let filterProviderSelectBulk = d.getElementById("provider-select-all");
    filterProviderSelectBulk.addEventListener("change", (event) => {
        let checked = event.target.checked,
            providers = d.querySelectorAll(`#filter-providers > li:not(.d-none) input[type="checkbox"]`);
        providers.forEach((provider) => {
            provider.checked = checked;
            if(filters.providers.hasOwnProperty(provider.value)) {
                filters.providers[provider.value] = checked;
            }
        });
        track(["send", "event", "filter requests", ((checked) ? "show" : "hide") + " all"]);
        updateFiltersStyles();
    });

    // Add our filter
    d.getElementById("provider-search").addEventListener("input", (event) => {
        let searchTerm = (event.target.value || "").toLowerCase(),
            providers = d.querySelectorAll("#filter-providers > li");

        providers.forEach((provider) => {
            let name = provider.getAttribute("data-provider") || "";
            if(name.toLowerCase().indexOf(searchTerm) >= 0)
            {
                provider.classList.remove("d-none");
            }
            else
            {
                provider.classList.add("d-none");
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
            defaultFilename = false,
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
            defaultFilename = true;
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
        exportText = `"` + ["##OMNIBUG_NAME## v##OMNIBUG_VERSION##", "Exported " + (new Date()).toString()].join(colDelim) + `"\n`
                   + `"` + ["Event Type", "Provider", "Account", "Request ID", "Request URL", "POST Data", "Timestamp", "Notes"].join(colDelim) + `"\n` + exportText;


        // Generate the file to download
        let blob = new Blob([exportText], {type: `text/${fileType}`}),
            url = window.URL.createObjectURL(blob);

        let link = createElement("a", {
            "attributes": {
                "href": url,
                "download": filename
            }
        });
        d.body.appendChild(link);

        // Force the download
        link.click();
        window.URL.revokeObjectURL(url);

        // Clean up
        link.remove();

        track(["send", {
            "hitType": "event",
            "eventCategory": "export data",
            "eventAction": fileType,
            "eventLabel": (defaultFilename) ? "default filename" : "custom filename",
            "metric1": exportData.length,
            "dimension5": String(showNavigation),
            "dimension6": String(useFilters)
        }]);

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
            request = recordedData.find((r) => {
                return r.event === "webRequest" && String(r.request.id) === id && String(r.request.timestamp) === timestamp;
            });
        if(typeof request !== "undefined") {
            // this _should_ always trigger, but just in case...
            request.request.note = input.value;
        }
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
        let details = createElement("details", {
                "classes": ["request"],
                "attributes": {
                    "data-request-id": request.request.id,
                    "data-provider": request.provider.key,
                    "data-timestamp": request.request.timestamp,
                    "data-account": ""
                }
            }),
            body = createElement("div");

        // Update any redirected entries
        updateRedirectedEntries(request.request.id);

        // Setup parent details element
        if(settings.alwaysExpand) {
            details.setAttribute("open", "open");
        }

        // Add the summary (title)
        let colTitleSpan = createElement("span", {
                "attributes": {
                    "title": request.provider.name
                },
                "text": request.provider.name
            }),
            colTitleRedirectIcon = createElement("i", {
                "classes": ["fas", "fa-sync"]
            }),
            colTitleRedirect = createElement("small", {
                "classes": ["redirect", "redirect-icon"],
                "attributes": {
                    "title": "This entry was redirected."
                },
                "children": [colTitleRedirectIcon]
            }),
            colAccount = createElement("div", {
                "classes": ["column", "col-3", "col-lg-4", "col-md-4", "col-sm-5"]
            }),
            requestTypeValue;


        // Add the provider name & request type (if applicable)
        if(request.provider.columns.requestType) {
            requestTypeValue = request.data.find((el) => {
                return el.key === request.provider.columns.requestType;
            });
        }
        if(!requestTypeValue) {
            requestTypeValue = {"value": "Other"};
        }

        let requestTypeEl = createElement("span", {
                "classes": ["label"],
                "attributes": {
                    "data-request-type": requestTypeValue.value,
                },
                "text": requestTypeValue.value
            });

        let colTitleWrapper = createElement("div", {
                "classes": ["column", "col-3", "col-lg-4", "col-md-4", "col-sm-5"],
                "children": [requestTypeEl, colTitleSpan, colTitleRedirect],
                "attributes": {
                    "title": request.provider.name + " - " + requestTypeValue.value
                }
            });

        // Add the account ID, if it exists
        let accountValue = getMappedColumnValue("account", request);

        if(accountValue) {
            colAccount.innerText = accountValue;
            colAccount.setAttribute("title", accountValue);
            details.setAttribute("data-account", accountValue);
        }

        // Add the timestamp
        let timestamp = new Date(request.request.timestamp).toLocaleString(),
            colTime = createElement("div", {
                "classes": ["column", "col-6", "col-lg-4", "col-md-4", "col-sm-2"],
                "text": timestamp,
                "attributes": {
                    "title": timestamp
                }
            });

        // Wrap everything
        let summaryColumns = createElement("div", {
                "classes": ["columns"],
                "children": [colTitleWrapper, colAccount, colTime]
            }),
            summaryContainer = createElement("div", {
                "classes": ["container"],
                "children": [summaryColumns]
            }),
            summary = createElement("summary", {
                "children": [summaryContainer]
            });

        // Append our summary
        details.appendChild(summary);

        let redirectHelpLink = createElement("a", {
                "attributes": {
                    "target": "_blank",
                    "href": "https://omnibug.io/help/redirected-requests"
                },
                "text": "Learn more."
            }),
            redirectWarning = createElement("div", {
                "classes": ["redirect", "toast", "toast-warning"],
                "text": "This request was redirected, thus the data may not be the final data sent to the provider. ",
                "children": [redirectHelpLink]
            });
        body.appendChild(redirectWarning);

        // Add the note field & listener
        let noteInput = createElement("input", {
                "classes": ["form-input"],
                "attributes": {
                    "type": "text",
                    "placeholder": "Enter a note about this request…"
                }
            }),
            noteWrapper = createElement("div", {
                "classes": ["form-group", "request-note"],
                "children": [noteInput]
            });
        noteInput.addEventListener("input", noteListener);
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
        }, {"summary": requestSummary});

        let groups = request.provider.groups || [];
        groups.unshift({"key": "summary", "name": "Summary"});
        groups.push({"key": "other", "name": "Other"});

        groups.forEach((group) => {
            if (data[group.key]) {
                let panel = buildRequestPanel(group.name, data[group.key], !settings.showFullNames);
                body.appendChild(panel);
            }
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
        let wrapper = createElement("details", {
            "classes": ["request-details"]
        });
        if(title !== "Summary") {
            wrapper.setAttribute("open", "open");
        }

        // Add the summary (title)
        let summary = createElement("summary");
        summary.innerText = title;
        wrapper.appendChild(summary);

        // Setup the table
        let tableBody = createElement("tbody");

        // Loop through each of the data objects to create a new table row
        data.sort((a, b) => {
            let aKey = a.field.toLowerCase(),
                bKey = b.field.toLowerCase();
            return aKey.localeCompare(bKey, "standard", {"numeric": true});
        }).forEach((row) => {
            let nameKey = createElement("span", {
                    "classes": ["parameter-key"],
                    "text": row.key
                }),
                nameField = createElement("span", {
                    "classes": ["parameter-field"],
                    "text": row.field
                }),
                value = createElement("td", {
                    "classes": ["parameter-value"],
                    "text": row.value
                }),
                name = createElement("td", {
                    "attributes": {
                        "title": `${row.field} (${row.key})`
                    },
                    "children": [nameKey, nameField]
                }),
                tableRow = createElement("tr", {
                    "attributes": {
                        "data-parameter-key": row.key
                    },
                    "children": [name, value]
                });

            tableBody.appendChild(tableRow);
        });

        // Append the final results
        let table = createElement("table", {
                "classes": ["table", "table-striped", "table-hover"],
                "children": [tableBody]
            });
        wrapper.appendChild(table);

        return wrapper;
    }

    /**
     * Add a navigation event to the panel
     *
     * @param navigation
     */
    function addNavigation(navigation) {
        let request = createElement("div", {
            "classes": ["navigation", "noselect"],
            "text": "Navigated to " + navigation.request.url
        });

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
     * @param fromStorage
     */
    function loadSettings(newSettings, fromStorage = false) {
        let styleSheet = d.getElementById("settingsStyles");

        settings = newSettings;

        if(!storageLoadedSettings && fromStorage && settings.allowTracking) {
            // Load GA script
            (function(o,m,n,i,b,u,g){o['GoogleAnalyticsObject']=b;o[b]=o[b]||function(){
                (o[b].q=o[b].q||[]).push(arguments)},o[b].l=1*new Date();u=m.createElement(n),
                g=m.getElementsByTagName(n)[0];u.async=1;u.src=i;g.parentNode.insertBefore(u,g)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','tracker');
            tracker("set", "dimension2", String(settings.showRedirects));
            tracker("set", "dimension3", String(settings.showNavigation));
            tracker("set", "dimension4", String(settings.showNotes));
            tracker("send", "pageview", "/panel");
            storageLoadedSettings = true;
        }

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

        // Reverse the direction of the entries to show newest first
        if(settings.requestSortOrder === "desc") {
            styleSheet.sheet.insertRule(`#requests {display: flex; flex-direction: column-reverse;}`, styleSheet.sheet.cssRules.length);
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
            let input = createElement("input", {
                    "attributes": {
                        "type": "checkbox",
                        "id": `filter-provider-${providerKey}`,
                        "value": providerKey
                    },
                }),
                span = createElement("span", {
                    "text": allProviders[providerKey].name
                }),
                label = createElement("label", {
                    "classes": ["noselect"],
                    "attributes": {
                        "for": `filter-provider-${providerKey}`
                    },
                    "children": [input, span]
                }),
                wrapper = createElement("li", {
                    "attributes": {
                        "data-provider": providerKey
                    },
                    "children": [label]
                });

            // Check if the user has the provider enabled or not
            if(!settings.providers[providerKey].enabled) {
                input.setAttribute("disabled", "disabled");
                label.classList.add("disabled");
                label.setAttribute("title", "This provider is currently disabled and requests for this provider will never be shown. You can re-enable it within the settings");
            } else {
                if(filters.providers[providerKey]) {
                    input.checked = true;
                }
            }

            providerList.appendChild(wrapper);

            // Add our event listener
            input.addEventListener("input", (event) => {
                let checkbox = event.target,
                    providerKey = checkbox.value;
                filters.providers[providerKey] = checkbox.checked;
                track(["send", "event", "filter requests", ((checkbox.checked) ? "show" : "hide") + "provider", providerKey]);
                updateFiltersStyles();
            });

            filters.providers[providerKey] = input.checked;
        }

        // Finally, update our stylesheet with the new filters
        updateFiltersStyles(true);
    }

    /**
     * Update the filters stylesheet
     * @param   fromBuilder
     */
    function updateFiltersStyles(fromBuilder = false) {
        let styleSheet = d.getElementById("filterStyles");

        // Clear out any existing styles
        clearStyles(styleSheet);

        console.log("providers", filters.providers);

        // Figure out what providers are hidden
        let hiddenProviders = Object.entries(filters.providers).filter((provider) => {
            return !provider[1] && (settings.providers[provider[0]].enabled);
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
     * GA Tracking
     *
     * @param data
     * @param force
     */
    function track(data, force = false) {
        if(settings.allowTracking || force) {
            tracker.apply(window, data);
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
                    loadSettings(message.data, true);
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