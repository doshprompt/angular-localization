module.exports = function (config) {
    'use strict';

    config.set({
        basePath : '../',

        files : [
            'lib/angular/angular.js',
            'lib/angular-cookies/angular-cookies.js',
            'lib/angular-sanitize/angular-sanitize.js',
            'lib/angular-mocks/angular-mocks.js',
            'src/**/*.js',
            'tests/unit/**/*.js'
        ],

        frameworks: [ 'jasmine' ],

        singleRun: true,

        browsers : [ 'PhantomJS' ],

        plugins : [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'out/unit.xml',
            suite: 'unit'
        }
  });
};