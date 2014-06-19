(function __init() { // INITIALIZATION FN
    'use strict';

    var myApp = {
        definitions: {
            'ngLocalize.docs.demo': ['ngLocalize.Config', 'ngLocalize.Version'],
            'ngLocalize.docs.navbar': ['ngLocalize.Version'],
            'ngLocalize.docs.footer': []
        },
        dependencies: [
            'ngLocalize',
            'mgcrea.ngStrap'
        ],
        appName: 'ngLocalize.docs'
    };

    angular.forEach(myApp.definitions, function (value, key) {
        angular.module(key, value);
        myApp.dependencies.push(key);
    });

    angular.module(myApp.appName, myApp.dependencies)
        .value('localeSupported', [
            'en-US',
            'fr-FR'
        ]);;
})();