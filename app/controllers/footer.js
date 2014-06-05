angular.module('ngLocalize.docs.footer')
    .controller('FootControl', ['$scope', 'locale', 'localeSupported', 'localeEvents',
        function ($scope, locale, localeSupported, localeEvents) {
            'use strict';

            $scope.currentYear = new Date().getFullYear();
            $scope.fullName = 'Rahul Doshi';
        }
    ]);