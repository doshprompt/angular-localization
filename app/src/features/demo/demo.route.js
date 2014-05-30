angular.module('myApp.features.demo')
    .config(['$routeProvider',
        function ($routeProvider) {
            'use strict';

            $routeProvider.
                when('/demo', {
                    templateUrl: 'src/features/demo/demo.part.html',
                    // controller: 'HomeControl'
                });
        }
    ]);