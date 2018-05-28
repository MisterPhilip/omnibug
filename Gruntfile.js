/* globals module, require */
module.exports = function(grunt) {

    grunt.config.init({
        "extension": {
            "name": "Omnibug",
            "version": "0.6.0",
            "storageKey": "omnibug"
        },
        "chrome": {
            "usePolyfill": true,
            "folder": "chromium"
        },
        "firefox": {
            "gecko": "Omnibug@rosssimpson.com",
            "usePolyfill": false,
            "folder": "firefox"
        },
        "clean": {
            "chrome": ["platform/chromium", "build/chrome_*.zip"],
            "firefox": ["platform/firefox", "build/firefox_*.zip"],
            "providers": ["src/providers.js"],
            "test": ["test/*.js", "!test/polyfills.js"]
        },
        "watch": {
            "providers": {
                "files": ["src/providers/**"],
                "tasks": [
                    "build-test-providers",
                    "build-providers"
                ],
                "options": {
                    "spawn": false,
                },
            },
            "chrome": {
                "files": ["src/**"],
                "tasks": [
                    "clean:chrome",
                    "build-copy:chrome",
                    "chrome-manifest",
                    "build-concat:chrome"
                ],
                "options": {
                    "spawn": false,
                },
            },
            "firefox": {
                "files": ["src/**"],
                "tasks": [
                    "clean:firefox",
                    "build-copy:firefox",
                    "firefox-manifest",
                    "build-concat:firefox"
                ],
                "options": {
                    "spawn": false,
                },
            }
        },
        "jshint": {
            "options": {
                "bitwise": true,
                "camelcase": false,
                "curly": true,
                "eqeqeq": true,
                "esversion": 6,
                "forin": true,
                "immed": true,
                "indent": 4,
                "latedef": true,
                "newcap": true,
                "noarg": true,
                "noempty": true,
                "nonew": true,
                "plusplus": false,
                "quotmark": true,
                "regexp": true,
                "undef": true,
                "unused": true,
                "strict": false,
                "trailing": true,
                "white": false,
                "laxcomma": true,
                "nonstandard": true,
                "browser": true,
                "maxparams": 3,
                "maxdepth": 4,
                "maxstatements": 50,
                "maxerr": 200,
                "globals": {
                    "browser": true,
                    "console": true,
                    "OmnibugProvider": true,
                    "BaseProvider": true
                },
                "reporter": require("jshint-html-reporter"),
                "reporterOutput": "build/jshint/index.html"
            },
            "all": [
                "Gruntfile.js",
                "src/providers/*.js",
                "src/libs/*.js",
                "src/options/*.js",
                "src/devtools/*.js",
                "src/*.js"
            ],
            "build": [
                "Gruntfile.js"
            ],
            "source": [
                "src/*.js"
            ],
            "providers": [
                "src/providers/*.js"
            ]
        },
        "pkg": grunt.file.readJSON("package.json"),
        "sass": {
            "dist": {
                "files": {
                    "src/devtools/panel.css": "src/devtools/panel.scss",
                    "src/options/options.css": "src/options/options.scss"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-sass');

    grunt.registerTask("build-extensions", "Build the Chrome extension", (browsers = "") => {
            let allowedBrowsers = ["chrome", "firefox"];
        if(browsers === "") {
            browsers = allowedBrowsers;
        } else {
            browsers = browsers.split(",");
        }
        grunt.task.run("build-providers");
        browsers.forEach((b) => {
            if(allowedBrowsers.indexOf(b) > -1) {
                grunt.task.run(
                    "clean:" + b,
                    "sass",
                    "build-copy:" + b,
                    b + "-manifest",
                    "build-concat:" + b,
                    "build-placeholders:" + b,
                    "build-compress:" + b
                );
            } else {
                grunt.log.warn("Unknown browser " + b);
            }
        });
    });

    grunt.registerTask("chrome-manifest", "Build the Chrome manifest.json file", function() {
        grunt.config.requires("extension.version");

        let browserOptions = grunt.config("chrome"),
            extensionOptions = grunt.config("extension"),
            manifest = grunt.file.readJSON("src/manifest.json");

        if(browserOptions.usePolyfill) {
            manifest.background.scripts.unshift("libs/browser-polyfill.js");
        }

        manifest.name = extensionOptions.name;
        manifest.version = extensionOptions.version;

        // Remove anything that will break Chrome
        delete manifest.applications;
        delete manifest.options_ui.browser_style;

        grunt.file.write("platform/" + browserOptions.folder + "/manifest.json", JSON.stringify(manifest, null, 4));
        grunt.log.write("Created Chrome's manifest.json. ").ok();
    });

    grunt.registerTask("firefox-manifest", "Build the Firefox manifest.json file", function() {
        grunt.config.requires("extension.version", "firefox.gecko");

        let browserOptions = grunt.config("firefox"),
            extensionOptions = grunt.config("extension"),
            manifest = grunt.file.readJSON("src/manifest.json");

        if(browserOptions.usePolyfill) {
            manifest.background.scripts.unshift("libs/browser-polyfill.js");
        }

        manifest.name = extensionOptions.name;
        manifest.version = extensionOptions.version;
        manifest.applications.gecko.id = browserOptions.gecko;

        // Remove anything that will break Firefox"s import routine
        delete manifest.options_ui.chrome_style;
        delete manifest.options_page;
        delete manifest.background.persistent;

        grunt.file.write("platform/" + browserOptions.folder + "/manifest.json", JSON.stringify(manifest, null, 4));
        grunt.log.write("Created Firefox's manifest.json. ").ok();
    });

    grunt.registerTask("build-copy", "Copy over the source files to the build directory", function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser),
            filesToCopy = ["eventPage.js", "providers.js", "options/*.*", "devtools/*.*", "assets/**", "libs/*.*", "!*./*.scss"];
        if(options.usePolyfill) {
            filesToCopy.push("browser-polyfill.js");
        }

        grunt.config.set("copy." + browser, {
            files: [
                {
                    expand: true,
                    cwd: "src/",
                    src: filesToCopy,
                    dest: "./platform/" + options.folder
                }
            ]});
        grunt.task.run("copy:" + browser);
    });

    grunt.registerTask("build-concat", "Concat build files for a browser", function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser);
        let destFiles = {},
            baseFiles = [];

        if(options.usePolyfill)
        {
            baseFiles.push("src/libs/browser-polyfill.js");
        }
        destFiles["platform/" + options.folder + "/options/options.js"] = baseFiles.concat(["src/options/options.js"]);
        destFiles["platform/" + options.folder + "/devtools/devtools.js"] = baseFiles.concat(["src/devtools/devtools.js"]);
        destFiles["platform/" + options.folder + "/devtools/panel.js"] = baseFiles.concat(["src/devtools/panel.js"]);
        grunt.config.set("concat." + browser, {
            files: destFiles
        });
        grunt.task.run("concat:" + browser);
    });

    grunt.registerTask("build-placeholders", "Update placeholders in built files", function(browser) {
        grunt.config.requires(browser, "extension");
        let browserOptions = grunt.config(browser),
            extensionOptions = grunt.config("extension"),
            config = {
                "src": [
                    "platform/" + browserOptions.folder + "/manifest.json",
                    "platform/" + browserOptions.folder + "/**/*.js",
                    "platform/" + browserOptions.folder + "/*.js",
                    "platform/" + browserOptions.folder + "/**/*.html",
                    "platform/" + browserOptions.folder + "/*.html"
                ],
                "overwrite": true,
                "usePrefix": false,
                "replacements": [
                    {
                        "from": "##OMNIBUG_VERSION##",
                        "to": "<%= pkg.version %>"
                    },
                    {
                        "from": "##OMNIBUG_NAME##",
                        "to": extensionOptions.name
                    },
                    {
                        "from": "##OMNIBUG_KEY##",
                        "to": extensionOptions.storageKey
                    },
                    {
                        "from": "##BROWSER##",
                        "to": browser
                    }
                ]
            };
        grunt.config.set("replace." + browser, config);
        grunt.task.run("replace:" + browser);
    });

    grunt.registerTask("build-compress", "Compress build files into extension .zip", function(browser) {
        grunt.config.requires(browser, "extension");
        let options = grunt.config(browser),
            extensionOptions = grunt.config("extension");

        grunt.config.set("compress." + browser, {
            options: {
                archive: "./build/" + browser + "_" + extensionOptions.version + ".zip"
            },
            files: [
                {
                    expand: true,
                    cwd: "platform/" + options.folder,
                    src: ["**/*"],
                    dest: "/"
                }
            ]
        });
        grunt.task.run("compress:" + browser);
    });

    grunt.registerTask("build-test-files", "Build everything for testing", function() {

        grunt.config.set("concat.test-port", {
            "options": {
                "footer": "\nexport { OmnibugPort };"
            },
            "files": {
                "./test/OmnibugPort.js": [
                    "./src/libs/OmnibugPort.js",
                ]
            }
        });
        grunt.config.set("concat.test-settings", {
            "options": {
                "banner": "import { OmnibugProvider } from \"./providers.js\"\n",
                "footer": "\nexport { OmnibugSettings };"
            },
            "files": {
                "./test/OmnibugSettings.js": [
                    "./src/libs/OmnibugSettings.js",
                ]
            }
        });

        const sourceBasePath = "./src/providers/",
            ignoreFile = "!" + sourceBasePath + "providers.js";

        // Grab all of the provider names to append as an export list
        let providers = grunt.file.expand([sourceBasePath + "*.js", ignoreFile]).map((fileName) => {
            fileName = fileName.replace(sourceBasePath, "").split(".")[0];
            return fileName.indexOf("Provider") === -1 ? fileName + "Provider" : fileName;
        });

        // Load our providers into OmnibugProvider
        let providerInclude = [];
        providers.forEach((provider) => {
            if(["OmnibugProvider", "BaseProvider"].indexOf(provider) === -1) {
                providerInclude.push(`OmnibugProvider.addProvider(new ${provider}());`);
            }
        });

        grunt.config.set("concat.providers-test", {
            "options": {
                "banner":   "const { URL } = require(\"url\");\n" +
                "var URLSearchParams = require(\"url-search-params\");\n",
                "footer": `\n${providerInclude.join("\n")}\nexport { ${providers.join(", ")} };`
            },
            "files": {
                "./test/providers.js": [
                    sourceBasePath + "BaseProvider.js",
                    sourceBasePath + "OmnibugProvider.js",
                    sourceBasePath + "*.js",
                    ignoreFile
                ]}
        });
        grunt.task.run(["clean:test", "concat:providers-test", "concat:test-port", "concat:test-settings"]);
    });

    /**
     * Build providers for production usage
     *
     * This will build the providers for use within the plugin, NOT for testing
     */
    grunt.registerTask("build-providers", "Combine providers into a single file", function() {
        grunt.task.run("clean:providers");

        const sourceBasePath = "./src/providers/",
            ignoreFile = "!" + sourceBasePath + "providers.js";

        // Grab all of the provider names to append as an export list
        let providers = grunt.file.expand([sourceBasePath + "*.js", ignoreFile]).map((fileName) => {
            fileName = fileName.replace(sourceBasePath, "").split(".")[0];
            return fileName.indexOf("Provider") === -1 ? fileName + "Provider" : fileName;
        });

        // Load our providers into OmnibugProvider
        let providerInclude = [];
        providers.forEach((provider) => {
            if(["OmnibugProvider", "BaseProvider"].indexOf(provider) === -1) {
                providerInclude.push(`OmnibugProvider.addProvider(new ${provider}());`);
            }
        });

        grunt.config.set("concat.providers", {
            "options": {
                "footer": `\n${providerInclude.join("\n")}`
            },
            files: {
                "./src/providers.js": [
                    sourceBasePath + "BaseProvider.js",
                    sourceBasePath + "OmnibugProvider.js",
                    sourceBasePath + "*.js"
                ],
            }
        });
        grunt.task.run("concat:providers");
    });

    /*
     * Add aliases
     */
    grunt.registerTask("default", ["build-extensions"]);
    grunt.registerTask("build", ["build-extensions"]);
};