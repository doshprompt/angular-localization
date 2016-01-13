angular.module('myApp.core.router')
    .config(['$routeProvider', 'localeProvider',
        function ($routeProvider, localeProvider) {
            'use strict';

            $routeProvider.
                when('/home', {
                    templateUrl: 'src/core/views/_home.html',
                    // controller: 'HomeControl'
                }).
                otherwise({
                    redirectTo: '/home'
                });

            localeProvider.init({
                supported: [
                    'en-US',
                    'fr-FR',
                ]
            });
        }
    ]);
