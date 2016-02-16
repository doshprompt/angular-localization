module.exports = function (config) {
    'use strict';

    config.set({
        files : [
            // support for bind in phnatomjs 1.9
            './node_modules/phantomjs-polyfill/bind-polyfill.js',

            'lib/angular/angular.js',
            'lib/angular-cookies/angular-cookies.js',
            'lib/angular-sanitize/angular-sanitize.js',
            'lib/angular-sanitize/angular-sanitize.js',
            'lib/ngstorage/ngStorage.js',

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
