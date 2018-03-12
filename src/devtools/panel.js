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
        settings = {},
        requestPanel = d.getElementById("requests"),
        noRequests = d.getElementById("no-requests"),
        styleSheet = d.getElementById("dynamicStyles");

    // Clear all requests
    d.querySelectorAll("a[href=\"#clear\"]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            // Clear our current requests
            while (requestPanel.firstChild) {
                requestPanel.removeChild(requestPanel.firstChild);
            }

            // Show the no requests found notification
            noRequests.classList.remove("d-none");
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

    function addRequest(request) {
        noRequests.classList.add("d-none");
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
     * Build HTML for a request
     *
     * @param request
     * @return {HTMLElement}
     */
    function buildRequest(request) {
        let details = createElement("details", ["request"], {"data-request-id": request.request.id}),
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
        if(request.provider.columns.account) {
            let accountValue = request.data.find((el) => {
                return el.key === request.provider.columns.account;
            });
            if(accountValue) {
                colAccount.innerText = accountValue.value;
                colAccount.setAttribute("title", accountValue.value);
            }
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
            if(aKey < bKey) { return -1; }
            if(aKey > bKey) { return 1; }
            return 0;
        }).forEach((row) => {
            let tableRow = createElement("tr", [], {"data-parameter-key": row.key}),
                name = createElement("td"),
                nameKey = createElement("span", ["parameter-key"], {"title": row.field}),
                nameField = createElement("span", ["parameter-field"], {"title": row.key}),
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
        request.innerText = "Navigated to " + navigation.url;
        requestPanel.appendChild(request);
    }

    /**
     * Load in new settings/styles
     *
     * @param newSettings
     */
    function loadSettings(newSettings) {
        settings = newSettings;

        // Clear out any existing rules
        while(styleSheet.sheet.cssRules.length) {
            styleSheet.sheet.removeRule(0);
        }

        // Highlight colors
        let highlightPrefix = "[data-parameter-key=\"",
            highlightKeys = highlightPrefix + settings.highlightKeys.join(`"], ${highlightPrefix}`) + "\"]",
            rule = `${highlightKeys} { background-color: ${settings.color_highlight}; }`;
        styleSheet.sheet.insertRule(rule);

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

    return {
        receive_message(message) {
            switch(message.event || "") {
                case "webRequest":
                    addRequest(message);
                break;
                case "webNavigation":
                    addNavigation(message.request);
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