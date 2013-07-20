/*global module*/
module.exports = function( grunt ) {
    "use strict";
    var gruntConfig = {};
    grunt.initConfig( gruntConfig );


    /*
     * JS Lint
     */
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    gruntConfig.jshint = {
        options: { bitwise: true, camelcase: false, curly: true, eqeqeq: true, forin: true, immed: true,
                   indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, plusplus: false,
                   quotmark: true, regexp: true, undef: true, unused: true, strict: false, trailing: true,
                   white: false, laxcomma: true, nonstandard: true, browser: true, maxparams: 3, maxdepth: 4,
                   maxstatements: 50 },
        all: [
            "Gruntfile.js",
            "chrome/devtools.js"
            //"chrome/devtools_panel.js"
            //"common/providers.js"
            //"chrome/eventPage.js"
            //"chrome/options.js"
        ]
    };


    /*
     * Jasmine tests
     */
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    gruntConfig.jasmine = {
        src: {
            src: [
                //"src/js/**/*.js",
                //"!src/js/**/*.test.js"
                "common/*.js"
            ],
            options: {
                //specs: "src/js/**/*.test.js",
                specs: "test/common/*.js"
                /*
                junit: {
                    path: "output/testresults"
                }
                */
            }
        }
    };
    grunt.registerTask("test", "jasmine:src");


    /*
    gruntConfig.jasmine.istanbul= {
        src: gruntConfig.jasmine.src.src,
        options: {
            specs: gruntConfig.jasmine.src.options.specs,
            template: require("grunt-template-jasmine-istanbul"),
            templateOptions: {
                coverage: "output/coverage/coverage.json",
                report: [
                    {type: "html", options: {dir: "output/coverage"}},
                    {type: "cobertura", options: {dir: "output/coverage/cobertura"}},
                    {type: "text-summary"}
                ]
            }
        }
    };
    grunt.registerTask("coverage", "jasmine:istanbul");
    */


    // copies dependency files into place
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    gruntConfig.copy = {
        main: {
            files: [
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "chrome/" },
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "firefox/chrome/content/omnibug/" }
            ]
        }
    };
    grunt.registerTask( "makeDev", [ "copy" ] );

    // clean the project dir
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    gruntConfig.clean = {
        clean: [ "*.xpi", "*.crx",
                 "chrome/providers.js", "chrome/omnibugurl.js",
                 "firefox/chrome/content/omnibug/providers.js", "firefox/chrome/content/omnibug/omnibugurl.js" ]
    };

    /*
     * Build Chrome extension
     */
    grunt.loadNpmTasks( "grunt-crx" );
    gruntConfig.crx = {
        omnibugPackage: {
            "src": "chrome/",
            "dest": ".",
            "privateKey": "omnibug.pem"

        }
    };
    grunt.registerTask( "makeChrome", [ "copy", "crx" ] );


    /*
     * Build Firefox extension
     */
    grunt.loadNpmTasks( "grunt-contrib-compress" );
    gruntConfig.compress = {
        site: {
            options: {
                archive: "foo.zip"
            },
            files: [
                { expand: true, cwd: "firefox/", src: [ "chrome/**" ] },
                { expand: true, cwd: "firefox/", src: [ "defaults/**" ] },
                { expand: true, cwd: "firefox/", src: [ "chrome.manifest" ] },,
                { expand: true, cwd: "firefox/", src: [ "install.rdf.site" ], rename: function( d, s ) {
                    return s.replace( /\.site|\.amo/, "" );
                } }
            ]
        },
        amo: {
            options: {
                archive: "foo.zip"
            },
            files: [
                { expand: true, cwd: "firefox/", src: [ "chrome/**" ] },
                { expand: true, cwd: "firefox/", src: [ "defaults/**" ] },
                { expand: true, cwd: "firefox/", src: [ "chrome.manifest" ] },,
                { expand: true, cwd: "firefox/", src: [ "install.rdf.amo" ], rename: function( d, s ) {
                    return s.replace( /\.site|\.amo/, "" );
                } }
            ]
        }
    };
    grunt.registerTask( "makeFirefox", [ "copy", "compress:site" ] );

    grunt.registerTask( "makeAll", [ "clean", "jshint", "test", "copy", "makeChrome", "makeFirefox" ] );


    // CI tasks
    grunt.registerTask( "travis", ["jshint", "test" ]);

};
