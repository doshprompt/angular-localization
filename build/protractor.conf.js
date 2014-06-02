exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        '../tests/e2e/*.js'
    ],

    capabilities: {
        'browserName': 'phantomjs',
        'phantomjs.binary.path':'./node_modules/phantomjs/bin/phantomjs'
    },

    baseUrl: 'http://localhost:9001/app/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
