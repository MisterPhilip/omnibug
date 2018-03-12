/* globals OmnibugProvider */
(function() {

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
                let template = document.getElementById("highlight-parameter-template").innerHTML,
                    paramList = document.getElementById("highlight-params");

                paramList.innerHTML = "";

                value.forEach((param) => {
                    paramList.innerHTML += template.replace(/##PARAMETER##/g, param).replace(/##HIGHLIGHT_COLOR##/g, target.color_highlight);
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
                            if(prop === "color_highlight") {
                                let paramList = document.querySelectorAll("#highlight-params li");
                                paramList.forEach((param) => {
                                    param.setAttribute("style", `background-color: ${value}`);
                                })
                            }
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
                    } else if(input.checked && index === -1) {
                        valArray.push(value);
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
            });
        });
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
    });
}());