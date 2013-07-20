/*global module, require*/
module.exports = function( grunt ) {
    "use strict";
    grunt.file.mkdir( "build" );
    var gruntConfig = {
        pkg: grunt.file.readJSON( "package.json" ),
        deploy: grunt.file.readJSON( "deploy.json" )
    };
    grunt.initConfig( gruntConfig );


    /*
     * Copy artifacts to remote
     */
    grunt.loadNpmTasks( "grunt-scp" );
    gruntConfig.scp = {
        options: {
            host: "<%= deploy.host %>",
            username: "<%= deploy.username %>",
            privateKey: grunt.file.read( "deploy.key" )
        },
        chrome: {
            files: [
                { cwd: "build", src: "*.crx", dest: "<%= deploy.path %>" }
            ]
        },
        firefox: {
            files: [
                { cwd: "build", src: "<%= pkg.name %>-<%= pkg.version %>.xpi", dest: "<%= deploy.path %>" },
                { cwd: "firefox", src: "update.rdf", dest: "<%= deploy.path %>" }
            ]
        }
    };


    /*
     * Create a symlink on the remote end
     */
    grunt.loadNpmTasks( "grunt-ssh" );
    gruntConfig.sshexec = {
        link: {
            command: "ln -sf <%= deploy.path %><%= pkg.name %>-<%= pkg.version %>.xpi <%= deploy.path %><%= pkg.name %>-current.xpi",
            options: {
                path: "<%= deploy.path %>",
                host: "<%= deploy.host %>",
                username: "<%= deploy.username %>",
                privateKey: grunt.file.read( "deploy.key" )
            }
        }
    };


    /*
     * Shell commands
     * NOTE: this is non-portable and will likely only work on Linux/OS X!
     */
    grunt.loadNpmTasks( "grunt-shell" );
    gruntConfig.shell = {
        // Populate the updateHash value and sign the XPI
        signXPI: {
            command: [
                "set -e",
                "HASH=$( openssl sha1 build/<%= pkg.name %>-<%= pkg.version %>.xpi | awk '{ print $2 }' )",
                "cat firefox/update.rdf.tpl | sed \"s/TOK_HASH/${HASH}/g\" > firefox/update.rdf",
                "echo",
                "echo \"Please sign and verify `pwd`/firefox/update.rdf with McCoy now\"",
                "mccoy || exit 1"
            ].join( " && " ),
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        },

        // Tag the repo
        gitTag: {
            command: [
                "set -e",
                "git tag '<%= pkg.name %>-<%= pkg.version %>'",
                "echo echo git push --tags"
            ].join( " && " ),
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        },

        // Commit after doing a deploy
        gitCommitDeploy: {
            command: [
                "set -e",
                "echo echo git commit chrome/manifest.json firefox/install.rdf.amo firefox/install.rdf.site firefox/update.rdf.tpl -m'Commit for deploy <%= pkg.version %>'",
                "echo echo git push"
            ].join( " && " ),
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        },

        // Commit after bumping the version number
        gitCommitVersionIncrement: {
            command: [
                "set -e",
                "git commit package.json -m'Bump version number after release'",
                "git push"
            ].join( " && " ),
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        }
    };


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
    grunt.loadNpmTasks( "grunt-contrib-jasmine" );
    gruntConfig.jasmine = {
        src: {
            src: [
                //"src/js/**/*.js",
                //"!src/js/**/*.test.js"
                "common/*.js"
            ],
            options: {
                //specs: "src/js/**/*.test.js",
                specs: "test/common/*.js",
                junit: {
                    path: "build/test-results",
                    consolidate: true
                }
            }
        }
    };
    grunt.registerTask( "test", "jasmine:src" );


    /*
     * JS code coverage
     */
    gruntConfig.jasmine.istanbul= {
        src: gruntConfig.jasmine.src.src,
        options: {
            specs: gruntConfig.jasmine.src.options.specs,
            template: require( "grunt-template-jasmine-istanbul" ),
            templateOptions: {
                coverage: "build/coverage/coverage.json",
                report: [
                    { type: "html", options: { dir: "build/coverage" } },
                    { type: "cobertura", options: { dir: "build/coverage/cobertura" } },
                    { type: "text-summary" }
                ]
            }
        }
    };
    grunt.registerTask( "coverage", "jasmine:istanbul" );


    /*
     * Copy common files into place
     */
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    gruntConfig.copy = {
        chrome: {
            files: [
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "chrome/" },
            ]
        },
        firefox: {
            files: [
                { expand: true, cwd: "common/", src: [ "*.js" ], dest: "firefox/chrome/content/omnibug/" }
            ]
        }
    };
    grunt.registerTask( "makeDev", [ "copy" ] );


    /*
     * Clean the project dir
     */
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    gruntConfig.clean = {
        clean: [ "build",
                 "chrome/providers.js", "chrome/omnibugurl.js",
                 "firefox/chrome/content/omnibug/providers.js", "firefox/chrome/content/omnibug/omnibugurl.js",
                 "firefox/install.rdf", "firefox/update.rdf" ]
    };


    /*
     * Set correct version numbers in various files
     */
    grunt.loadNpmTasks( "grunt-version" );
    gruntConfig.version = {
        chrome: {
            src: [ "chrome/manifest.json" ]
        },
        firefox: {
            options: {
                prefix: "em:updateLink=\"http:\/\/.*\/omnibug-|[^\\-]em:version['\"]?\\s*[:=]\\s*['\"]",
                // NOTE: only supporting dot-separated digits (to keep from breaking em:updateLink)
                replace: "[0-9]+\\.[0-9]+\\.[0-9]+",
            },
            src: [ "firefox/install.rdf.site", "firefox/install.rdf.amo", "firefox/update.rdf.tpl" ]
        },
        omnibug: {
            src: [ "package.json" ],
            options: {
                release: "patch"
            }
        }
    };
    grunt.registerTask( "updateVersion", [ "version:omnibug", "shell:gitCommitVersionIncrement" ] );


    /*
     * Build Chrome extension
     */
    grunt.loadNpmTasks( "grunt-crx" );
    gruntConfig.crx = {
        omnibugPackage: {
            "src": "chrome/",
            "dest": "build/",
            "privateKey": "omnibug.pem",
            "exclude": [ "scripts" ]
        }
    };
    grunt.registerTask( "makeChrome", [ "copy:chrome", "version:chrome", "crx" ] );


    /*
     * Build Firefox extension
     */
    grunt.loadNpmTasks( "grunt-contrib-compress" );
    gruntConfig.compress = {
        site: {
            options: {
                archive: "build/<%= pkg.name %>-<%= pkg.version %>.xpi",
                mode: "zip"
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
                archive: "build/<%= pkg.name %>-amo-<%= pkg.version %>.xpi",
                mode: "zip"
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
    grunt.registerTask( "makeFirefox", [ "copy:firefox", "version:firefox", "compress:site", "compress:amo" ] );



    /*
     * Deploy tasks
     */
    grunt.registerTask( "deployFirefox", [ "makeFirefox", "shell:signXPI", "scp:firefox", "sshexec:link" ] );
    grunt.registerTask( "deployChrome", [ "makeChrome", "scp:chrome" ] );

    /*
     * Pipeline tasks
     */
    //grunt.registerTask( "makeAll", [ "clean", "jshint", "test", "makeChrome", "makeFirefox" ] );
    //grunt.registerTask( "firefox", [ "deployFirefox", "shell:gitCommitDeploy", "shell:gitTag", "updateVersion" ] );
    //grunt.registerTask( "chrome", [ "deployChrome", "shell:gitCommitDeploy", "shell:gitTag", "updateVersion" ] );
    grunt.registerTask( "release", [ "deployFirefox", "deployChrome", "shell:gitCommitDeploy", "shell:gitTag", "updateVersion" ] );

    // CI tasks
    grunt.registerTask( "travis", [ "jshint", "test", "coverage" ]);

};
