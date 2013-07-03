/*global module*/
module.exports = function (grunt) {
    'use strict';

    var gruntConfig = {};
    grunt.loadNpmTasks('grunt-contrib-jshint');
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
    grunt.initConfig(gruntConfig);

};
