/* globals module, require */
module.exports = function(grunt) {

    grunt.config.init({
        "chrome": {
            "version": "0.6.0",
            "usePolyfill": true,
            "folder": "chromium"
        },
        "firefox": {
            "version": "0.6.0",
            "gecko": "Omnibug@rosssimpson.com",
            "usePolyfill": false,
            "folder": "firefox"
        },
        "edge": {
            "version": "0.6.0",
            "usePolyfill": false,
            "folder": "edge"
        },
        "clean": {
            "chrome": ["platform/chromium", "build/chrome_*.zip"],
            "firefox": ["platform/firefox", "build/firefox_*.zip"],
            "edge": ["platform/edge", "build/edge_*.zip"],
            "providers": ["src/providers/providers.js"],
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
            },
            "edge": {
                "files": ["src/**"],
                "tasks": [
                    "clean:edge",
                    "build-copy:edge",
                    "edge-manifest",
                    "build-concat:edge"
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
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.registerTask("build-extensions", "Build the Chrome extension", (browsers = "") => {
            let allowedBrowsers = ["chrome", "firefox", "edge"];
        if(browsers === "") {
            browsers = allowedBrowsers;
        } else {
            browsers = browsers.split(",");
        }
        browsers.forEach((b) => {
            if(allowedBrowsers.indexOf(b) > -1) {
                grunt.task.run(
                    "clean:" + b,
                    "build-copy:" + b,
                    b + "-manifest",
                    "build-concat:" + b,
                    "build-compress:" + b
                );
            } else {
                grunt.log.warn("Unknown browser " + b);
            }
        });
    });

    grunt.registerTask("chrome-manifest", "Build the Chrome manifest.json file", function() {
        grunt.config.requires("chrome.version");

        let options = grunt.config("chrome"),
            manifest = grunt.file.readJSON("src/manifest.json");

        if(options.usePolyfill) {
            manifest.background.scripts.unshift("browser-polyfill.js");
        }

        manifest.version = options.version;

        // Remove anything that will break Chrome
        delete manifest.applications;
        delete manifest.options_ui.browser_style;

        grunt.file.write("platform/" + options.folder + "/manifest.json", JSON.stringify(manifest, null, 4));
        grunt.log.write("Created Chrome's manifest.json. ").ok();
    });

    grunt.registerTask("firefox-manifest", "Build the Firefox manifest.json file", function() {
        grunt.config.requires("firefox.version", "firefox.gecko");

        let options = grunt.config("firefox"),
            manifest = grunt.file.readJSON("src/manifest.json");

        if(options.usePolyfill) {
            manifest.background.scripts.unshift("browser-polyfill.js");
        }

        manifest.version = options.version;
        manifest.applications.gecko.id = options.gecko;

        // Remove anything that will break Firefox"s import routine
        delete manifest.options_ui.chrome_style;
        delete manifest.options_page;
        delete manifest.background.persistent;

        grunt.file.write("platform/" + options.folder + "/manifest.json", JSON.stringify(manifest, null, 4));
        grunt.log.write("Created Firefox's manifest.json. ").ok();
    });

    grunt.registerTask("edge-manifest", "Build the Edge manifest.json file", function() {
        grunt.config.requires("edge.version");

        let options = grunt.config("edge"),
            manifest = grunt.file.readJSON("src/manifest.json");

        if(options.usePolyfill) {
            manifest.background.scripts.unshift("browser-polyfill.js");
        }

        manifest.version = options.version;

        // Remove anything that will break Edge"s import routine
        delete manifest.manifest_version;
        delete manifest.options_ui.chrome_style;
        delete manifest.options_ui.browser_style;

        grunt.file.write("platform/" + options.folder + "/manifest.json", JSON.stringify(manifest, null, 4));
        grunt.log.write("Created Edge's manifest.json. ").ok();
    });

    grunt.registerTask("build-copy", "Copy over the source files to the build directory", function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser),
            filesToCopy = ["eventPage.js", "providers.js", "omnibugurl.js", "options/*.*", "devtools*", "images/*.*", "Omnibug*.js"];
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
            baseFiles.push("src/browser-polyfill.js");
        }
        destFiles["platform/" + options.folder + "/options/options.js"] = baseFiles.concat(["src/options/options.js"]);
        destFiles["platform/" + options.folder + "/devtools.js"] = baseFiles.concat(["src/devtools.js"]);
        grunt.config.set("concat." + browser, {
            files: destFiles
        });
        grunt.task.run("concat:" + browser);
    });

    grunt.registerTask("build-compress", "Compress build files into extension .zip", function(browser) {
        grunt.config.requires(browser);
        let options = grunt.config(browser);

        grunt.config.set("compress." + browser, {
            options: {
                archive: "./build/" + browser + "_" + options.version + ".zip"
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
                    "./src/OmnibugPort.js",
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
                    "./src/OmnibugSettings.js",
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

        grunt.config.set("concat.providers-test", {
            "options": {
                "banner":   "const { URL } = require(\"url\");\n" +
                "var URLSearchParams = require(\"url-search-params\");\n",
                "footer": "\nexport { " + providers.join(", ") + " };"
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
        const sourceBasePath = "./src/providers/";
        grunt.task.run("clean:providers");
        grunt.config.set("concat.providers", {
            files: {
                "./src/providers/providers.js": [
                    sourceBasePath + "BaseProvider.js",
                    sourceBasePath + "OmnibugProvider.js",
                    sourceBasePath + "*.js"
            ]}
        });
        grunt.task.run("concat:providers");
    });

    /*
     * Add aliases
     */
    grunt.registerTask("default", ["build-extensions"]);
    grunt.registerTask("build", ["build-extensions"]);
};