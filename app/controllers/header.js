angular.module('ngLocalize.docs.header')
    .controller('HeadControl', ['$scope', 'localeVer',
        function ($scope, localeVer) {
            $scope.currVersion = localeVer;
        }
    ]);
