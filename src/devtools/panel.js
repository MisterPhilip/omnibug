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
     *
     *
     * @param request
     * @return {HTMLElement}
     */
    function buildRequest(request) {
        let details = createElement("details", ["request"]),
            summary = createElement("summary"),
            body = createElement("div");

        // Setup parent details element
        if(settings.alwaysExpand) {
            details.setAttribute("open", "open");
        }

        // Add the summary (title)
        let summaryContainer = createElement("div", ["container"]),
            summaryColumns = createElement("div", ["columns"]),
            colTitleWrapper = createElement("div", ["column", "col-3"]),
            colTitleSpan = createElement("span"),
            colAccount = createElement("div", ["column", "col-3"]),
            colTime = createElement("div", ["column", "col-6"]);

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
            }
        }
        colTitleSpan.innerText = request.provider.name;
        colTitleWrapper.appendChild(colTitleSpan);
        summaryColumns.appendChild(colTitleWrapper);

        // Add the account ID, if it exists
        if(request.provider.columns.account) {
            let accountValue = request.data.find((el) => {
                return el.key === request.provider.columns.account;
            });
            console.log(request.provider.columns.account, accountValue);
            if(accountValue) {
                colAccount.innerText = accountValue.value;
            }
        }
        summaryColumns.appendChild(colAccount);

        // Add the timestamp
        colTime.innerText = new Date(request.request.timestamp);
        summaryColumns.appendChild(colTime);

        // Append our summary
        summaryContainer.appendChild(summaryColumns);
        summary.appendChild(summaryContainer);
        details.appendChild(summary);

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
                value = createElement("td");
            name.innerText = useKey ? row.key : row.field;
            value.innerText = row.value;

            tableRow.appendChild(name);
            tableRow.appendChild(value);
            tableBody.appendChild(tableRow);
        });

        // Append the final results
        table.appendChild(tableBody);
        wrapper.appendChild(table);

        return wrapper;
    }

    function loadSettings(newSettings) {
        settings = newSettings;

        // Clear out any existing rules
        for(let i=0; i<styleSheet.sheet.cssRules.length; i++) {
            styleSheet.sheet.removeRule(i);
        }

        // Highlight colors
        let highlightPrefix = "[data-parameter-key=\"",
            highlightKeys = highlightPrefix + settings.highlightKeys.join(`"], ${highlightPrefix}`) + "\"]",
            rule = `${highlightKeys} { background-color: ${settings.color_highlight}; }`;
        styleSheet.sheet.insertRule(rule);

        styleSheet.sheet.insertRule(`[data-request-type] { background-color: ${settings.color_click}; }`);
        styleSheet.sheet.insertRule(`[data-request-type="Page View"] { background-color: ${settings.color_load}; }`);
        styleSheet.sheet.insertRule(`[data-request-type="redirect"] { background-color: ${settings.color_redirect}; }`);
        styleSheet.sheet.insertRule(`[data-request-type="previous"] { background-color: ${settings.color_prev}; }`);
    }

    return {
        receive_message(message) {
            switch(message.event) {
                case "webRequest":
                    addRequest(message);
                break;
                case "webNavigation":
                    // do something
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