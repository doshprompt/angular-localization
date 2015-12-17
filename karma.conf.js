module.exports = function (config) {
    'use strict';

    config.set({
        files : [
            'lib/angular/angular.js',
            'lib/angular-cookies/angular-cookies.js',
            'lib/angular-sanitize/angular-sanitize.js',

            'lib/angular-mocks/angular-mocks.js',

            'src/**/*.module.js',
            'src/**/*.js',

            'tests/unit/**/*.js'
        ],

        frameworks: [ 'jasmine' ],

        singleRun: true,

        browsers : [ 'PhantomJS' ],

        preprocessors: {
            'src/**/*.js': [ 'coverage' ]
        },

        reporters: [
            'progress',
            'coverage'
        ],

        coverageReporter: {
            type: 'lcov',
            dir: 'coverage',
            subdir: '.'
        }
  });
};