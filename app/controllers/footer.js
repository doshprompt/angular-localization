angular.module('ngLocalize.docs.footer')
    .controller('FootControl', ['$scope', 'localeVer',
        function ($scope, localeVer) {
            'use strict';

            $scope.currentVersion = localeVer;
        }
    ]);