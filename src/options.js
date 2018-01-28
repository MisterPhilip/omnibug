/* globals OmnibugProvider */
(function() {
    let settings = new OmnibugSettings(),
        cached  = {};
    window.app = null;

    let providers = OmnibugProvider.getProviders(),
        availableParams = [];
    for(let provider in providers)
    {
        if(!providers.hasOwnProperty(provider)) { continue; }
        availableParams.push({
            "provider": providers[provider].name,
            "parameters": Object.keys(providers[provider].keys).map((key) => {
                return {
                    "parameter": key,
                    "name":      providers[provider].keys[key].name,
                    "provider":  providers[provider].key
                }
            })
        });
    }
    console.log(availableParams);

    function init(loadedSettings)
    {
        window.settings = loadedSettings;
        let highlightedKeys = [];

        loadedSettings.highlightKeys.forEach((parameter) => {
            if(typeof providers[parameter.provider] === "object" && typeof providers[parameter.provider].keys[parameter.parameter] === "object")
            {
                highlightedKeys.push({
                    "parameter": parameter.parameter,
                    "name":      providers[parameter.provider].keys[parameter.parameter].name,
                    "provider":  parameter.provider
                });
            }
            else
            {
                highlightedKeys.push({
                    "parameter": parameter.parameter,
                    "name":      parameter.parameter,
                    "provider":  parameter.provider
                });
            }

        });

        app = new Vue({
            "el": "#app",
            "components": {
                "Multiselect": VueMultiselect.Multiselect
            },
            "data": {
                "settings": loadedSettings,
                "availableProviders": providers,
                "availableParams": availableParams,
                "highlightedKeys": highlightedKeys,
                "providerFilter": ""
            },
            "watch": {
                "highlightedKeys": function(updatedParams) {
                    let params = [];
                    updatedParams.forEach((param) => {
                        params.push({
                            "parameter": param.parameter,
                            "provider":  param.provider
                        });
                    });
                    this.settings.highlightKeys = params;
                },
                "settings": {
                    "handler": function(newSettings, orgSettings) {
                        settings.save(newSettings);
                    },
                    "deep": true
                }
            },
            "computed": {
                "groupedProviders": function() {
                    let app = this,
                        groups = {};

                    for(let provider in providers)
                    {
                        if(!providers.hasOwnProperty(provider) || provider === "CUSTOM") { continue; }

                        let name = providers[provider].name.toLowerCase(),
                            filter = (this.providerFilter || "").toLowerCase(),
                            show = !(this.providerFilter && name.indexOf(filter) === -1);
                        if(!groups[providers[provider].type])
                        {
                            if(show)
                            {
                                groups[providers[provider].type] = [
                                    providers[provider]
                                ];
                            }
                            else
                            {
                                groups[providers[provider].type] = [];
                            }
                        }
                        else if(show)
                        {
                            groups[providers[provider].type].push(providers[provider]);
                        }
                    }

                    for(let group in groups)
                    {
                        if(!groups.hasOwnProperty(group)) { continue; }
                        groups[group].sort();
                    }
                    return groups;
                }
            },
            "methods": {
                "log": function(a) {
                    if(a.option && a.option.parameter === "pageName") {
                        console.log(a);
                    }
                },
                "getProviderName": function(provider) {
                    return this.availableProviders[provider].name;
                },
                "labelParameterWithName": function(parameter) {
                    return parameter.name + " (" + parameter.parameter + ")";
                },
                "addCustomProviderKey": function(value) {
                    const parameter = {
                        "parameter": value,
                        "name":      value,
                        "provider":  "CUSTOM"
                    };
                    if(!this.availableProviders.CUSTOM) {
                        this.availableProviders.CUSTOM = {
                            "name": "Custom",
                            "key":  parameter.provider
                        };
                    } else {
                        // At least 1 custom provider was added, so check to make sure we don't have a dupe
                        if(this.settings.highlightKeys.findIndex((param) => {
                                return param.parameter === parameter.parameter && param.provider === "CUSTOM";
                            }) > -1) {
                            // Ignore it
                            return;
                        }
                    }
                    this.highlightedKeys.push(parameter);
                    this.settings.highlightKeys.push({
                        "parameter": parameter.parameter,
                        "provider": parameter.provider
                    });
                },
                "reset": function(event) {
                    event.preventDefault();
                    this.settings = settings.defaults;
                },
            }
        });
    }

    document.addEventListener( 'DOMContentLoaded', function() {
        settings.load().then(init);
    });

}() );