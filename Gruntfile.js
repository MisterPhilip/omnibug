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
            "edge": ["platform/edge", "build/edge_*.zip"]
        },
        "watch": {
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
                    "console": true
                },
                "reporter": require("jshint-html-reporter"),
                "reporterOutput": "build/jshint/index.html"
            },
            "all": [
                "Gruntfile.js",
                "src/*.js"
            ]
        },
        "jasmine": {
            "src": {
                "src": [
                    "src/omnibugurl.js",
                    "src/providers.js"
                ],
                "options": {
                    "specs": [
                        "test/common/*.js",
                    ],
                    "junit": {
                        "path": "build/test-results",
                        "consolidate": true
                    },
                    "outfile": "test/SpecRunner.html",
                    "keepRunner": true
                }
            },
            "istanbul": {
                "src": [
                    "src/omnibugurl.js",
                    "src/providers.js"
                ],
                "options": {
                    "specs": [
                        "test/common/*.js",
                    ],
                    "template": require("grunt-template-jasmine-istanbul"),
                    "templateOptions": {
                        "coverage": "build/coverage/coverage.json",
                        "report": [
                            {
                                "type": "html",
                                "options": {
                                    "dir": "build/coverage"
                                }
                            },
                            {
                                "type": "cobertura",
                                "options": {
                                    "dir": "build/coverage/cobertura"
                                }
                            },
                            {
                                "type": "text-summary"
                            }
                        ]
                    }
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
    grunt.loadNpmTasks("grunt-contrib-jasmine");

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
            filesToCopy = ["eventPage.js", "providers.js", "omnibugurl.js", "options.*", "devtools*", "images/*.*"];
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
        let options = grunt.config(browser),
            sourceFiles = ["src/options.js"];
        if(options.usePolyfill) {
            sourceFiles.unshift("src/browser-polyfill.js");
        }

        grunt.config.set("concat." + browser, {
            src: sourceFiles,
            dest: "platform/" + options.folder + "/options.js"
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

    /*
     * Jasmine tests
     */
    grunt.registerTask( "test", "jasmine:src" );

    /*
     * JS code coverage
     */
    grunt.registerTask( "coverage", "jasmine:istanbul" );

    /*
     * CI tasks
     */
    grunt.registerTask( "travis", [ "test", "coverage" ]);
};