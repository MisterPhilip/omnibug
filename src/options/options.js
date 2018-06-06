/* globals OmnibugProvider */
(function() {

    // Setup GA tracker
    window.GoogleAnalyticsObject = "tracker";
    window.tracker = function(){ (window.tracker.q = window.tracker.q||[]).push(arguments), window.tracker.l=1*new Date(); };

    tracker("create", "##OMNIBUG_UA_ACCOUNT##", "auto");
    tracker("set", "checkProtocolTask", ()=>{});
    tracker("set", "dimension1", "##OMNIBUG_VERSION##");
    tracker("send", "pageview", "/settings");

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
            console.log(`setting ${prop} to ${value}`);
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
                if(values.hasOwnProperty(setting)) {
                    settings[setting] = values[setting];
                }
            }
        };

    // Show all available providers
    let providers = OmnibugProvider.getProviders(),
        providersList = document.getElementById("providers-list"),
        providerTemplate = document.getElementById("providers-template");
    for(let provider in providers)
    {
        if(!providers.hasOwnProperty(provider)) { continue; }
        let template = providerTemplate.innerHTML;
        template = template.replace(/##PROVIDER##/g, providers[provider].name).replace(/##VALUE##/g, provider);
        providersList.innerHTML += template;
    }

    // Grab the default settings & load in the user's settings
    let settingsProvider = new OmnibugSettings();
    loadSettingsIntoProxy(settingsProvider.defaults);
    settingsProvider.load().then((loadedSettings) => {

        // Update the settings page with our loaded settings
        loadSettingsIntoProxy(loadedSettings);

        // Add listeners to all of the inputs for 2-way binding
        document.querySelectorAll("input[data-bind-property]").forEach((input) => {
            input.addEventListener("change", (event) => {
                let field = input.getAttribute("data-bind-property"),
                    type  = input.type,
                    value = input.value;

                // Validate the input attributes
                if(!settings.hasOwnProperty(field) || !type) { return; }

                // Do some value manipulation as needed
                if(field === "enabledProviders") {
                    let index = settings[field].indexOf(value),
                        valArray = settings[field].slice();
                    console.log(value, input.checked, index);
                    if(!input.checked && index >= 0) {
                        valArray.splice(index, 1);
                        track(["send", "event", "settings", "enabledProviders", `removed: ${value}`]);
                    } else if(input.checked && index === -1) {
                        valArray.push(value);
                        track(["send", "event", "settings", "enabledProviders", `added: ${value}`]);
                    }
                    value = valArray;
                } else if(type === "checkbox") {
                    value = input.checked;
                } else if(type === "color") {
                    if(!/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(value)) {
                        value = "#FFFFFF";
                    }
                }

                // Update the object (and thus update any other elements attached to the field) & save the settings
                settings[field] = value;
                settingsProvider.save(settingsObj);

                if(field !== "enabledProviders" && field !== "highlightKeys") {
                    track(["send", "event", "settings", field, String(value)], (field === "allowTracking"));
                }
            });
        });


        // Track the settings page, if allowed
        if(settings.allowTracking) {
            // Load GA script
            (function(o,m,n,i,b,u,g){o['GoogleAnalyticsObject']=b;o[b]=o[b]||function(){
                (o[b].q=o[b].q||[]).push(arguments)},o[b].l=1*new Date();u=m.createElement(n),
                g=m.getElementsByTagName(n)[0];u.async=1;u.src=i;g.parentNode.insertBefore(u,g)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','tracker');
        }
    });

    document.getElementById("addParam").addEventListener("change", (event) => {
        event.preventDefault();

        let newParam = event.target.value,
            paramList = document.getElementById("highlight-params");

        if(newParam.trim() !== "" && settings.highlightKeys.indexOf(newParam) === -1) {
            paramList.appendChild(createHighlightParam(newParam));

            settings.highlightKeys.push(newParam);
            settingsProvider.save(settingsObj);

            track(["send", "event", "settings", "highlightKeys", `added: ${newParam}`]);
        }

        event.target.value = "";
    });

    document.getElementById("provider-search").addEventListener("input", (event) => {
        console.log("provider-search", event.target.value);
        let searchTerm = (event.target.value || "").toLowerCase(),
            providers = document.querySelectorAll("#providers-list > label");

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

    document.getElementById("reset-defaults").addEventListener("click", (event) => {
        event.preventDefault();
        let defaults = settingsProvider.defaults;
        loadSettingsIntoProxy(defaults);
        settingsProvider.save(defaults);

        if(settings.allowTracking) {
            track(["send", "event", "settings", "reset"]);
        }
    });

    function createHighlightParam(param) {
        let li = createElement("li"),
            text = createElement("span"),
            remove = createElement("span", ["remove"], {"title": "Remove"});

        text.innerText = param;
        remove.innerHTML = "&times;";

        remove.addEventListener("click", (event) => {
            event.preventDefault();
            settings.highlightKeys = settingsObj.highlightKeys = settingsObj.highlightKeys.filter(item => item !== param);
            settingsProvider.save(settingsObj);
            track(["send", "event", "settings", "highlightKeys", `removed: ${value}`]);
        });

        li.appendChild(text);
        li.appendChild(remove);

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


    /**
     * Shortcut to creating an HTML element
     *
     * @param type          String
     * @param classList     []
     * @param attributes    []
     * @return {HTMLElement}
     */
    function createElement(type, classList = [], attributes = {}) {
        let element = document.createElement(type);
        if(classList.length) {
            element.classList.add(...classList);
        }
        Object.entries(attributes).forEach((attribute) => {
            element.setAttribute(...attribute);
        });
        return element;
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
}());