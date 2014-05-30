(function __init() { // INITIALIZATION FN
    'use strict';

    var myApp = {
        definitions: {
            'myApp.core.router': [],
            'myApp.features.demo': [],
            'myApp.shared.components.footer': ['ngLocalize.InstalledLanguages', 'ngLocalize.Events']
        },
        dependencies: [
            'ngRoute',
            'ngLocalize',
            'myApp.core.router'
        ],
        appName: 'myApp'
    };

    angular.forEach(myApp.definitions, function (value, key) {
        angular.module(key, value);
        myApp.dependencies.push(key);
    });

    angular.module(myApp.appName, myApp.dependencies);
})();