/*global module*/
module.exports = function( grunt ) {
    'use strict';

    var gruntConfig = {};
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    gruntConfig.jshint = {
        options: { bitwise: true, camelcase: false, curly: true, eqeqeq: true, forin: true, immed: true,
                   indent: 4, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, plusplus: false,
                   quotmark: true, regexp: true, undef: true, unused: true, strict: false, trailing: true,
                   white: false, laxcomma: true, nonstandard: true, browser: true, maxparams: 3, maxdepth: 4,
                   maxstatements: 50 },
        all: [
            'Gruntfile.js',
            'chrome/devtools.js'
            //'chrome/devtools_panel.js'
            //'common/providers.js'
            //'chrome/eventPage.js'
            //'chrome/options.js'
        ]
    };

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    gruntConfig.jasmine = {
        src: {
            src: [
                //'src/js/**/*.js',
                //'!src/js/**/*.test.js'
                'common/*.js'
            ],
            options: {
                //specs: 'src/js/**/*.test.js',
                specs: 'test/common/*.js'
                /*
                junit: {
                    path: 'output/testresults'
                }
                */
            }
        }
    };
    grunt.registerTask('test', 'jasmine:src');

    /*
    gruntConfig.jasmine.istanbul= {
        src: gruntConfig.jasmine.src.src,
        options: {
            specs: gruntConfig.jasmine.src.options.specs,
            template: require('grunt-template-jasmine-istanbul'),
            templateOptions: {
                coverage: 'output/coverage/coverage.json',
                report: [
                    {type: 'html', options: {dir: 'output/coverage'}},
                    {type: 'cobertura', options: {dir: 'output/coverage/cobertura'}},
                    {type: 'text-summary'}
                ]
            }
        }
    };
    grunt.registerTask('coverage', 'jasmine:istanbul');
    */



    grunt.initConfig( gruntConfig );
    grunt.registerTask( 'travis', ['jshint', 'test' ]);

};
