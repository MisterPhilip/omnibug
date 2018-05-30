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
        exportText = `"` + ["##OMNIBUG_NAME## v##OMNIBUG_VERSION##", "Exported " + (new Date()).toString()].join(colDelim) + `"\n`
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
                return request.event === "webRequest" && String(request.request.id) === id && String(request.request.timestamp) === timestamp;
            });
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

        // Add the note field & listener
        let noteWrapper = createElement("div", ["form-group", "request-note"]),
            noteInput = createElement("input", ["form-input"], {"type": "text", "placeholder": "Enter a note about this request…"});
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