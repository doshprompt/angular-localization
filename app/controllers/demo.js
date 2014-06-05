angular.module('ngLocalize.docs.demo')
    .controller('DemoControl', ['$scope', '$filter', 'locale', 'localeConf', 'localeVer',
        function ($scope, $filter, locale, localeConf, localeVer) {
            'use strict';

            $scope.user = {
                name: 'Rahul Doshi'
            };

            $scope.strings = {
                no: locale.getString('common.no')
            };

            locale.ready('common').then(function () {
                $scope.strings.yes = locale.getString('common.yes');
            });

            $scope.messages = {
                generic: 'demo.genericErrorMessage',
                targeted: 'demo.targetedErrorMessage',
                tests: 'demo.testStatusMessage',
                copyright: 'demo.copyrightString',
                version: 'demo.currentVersion'
            };
            $scope.filtArgs = {
                tests: [ 5, 0 ],
                copyright: {
                    name: $scope.user.name,
                    year: new Date().getFullYear()
                },
                version: {
                    ver: localeVer
                }
            };

            locale.ready('demo').then(function () {
                $scope.specials = {
                    targeted: $filter('i18n')('demo.targetedErrorMessage' + localeConf.delimiter + '"test.json"'),
                    tests: $filter('i18n')('demo.testStatusMessage' + localeConf.delimiter + JSON.stringify($scope.filtArgs.tests)),
                    copyright: $filter('i18n')('demo.copyrightString' + localeConf.delimiter + JSON.stringify($scope.filtArgs.copyright)),
                    version: $filter('i18n')('demo.currentVersion' + localeConf.delimiter + JSON.stringify($scope.filtArgs.version))
                }
            });

            $scope.pluralization = {
                numCount: 1,
                options: {
                    zero: 'plurals.zeroPluralized',
                    one: 'plurals.onePluralized',
                    many: 'plurals.manyPluralized'
                },
                getPlural: function () {
                    var n = $scope.pluralization.numCount,
                        s;
                    switch (n) {
                    case null:
                    case undefined:
                    case 0:
                        s = $scope.pluralization.options.zero;
                        break;
                    case 1:
                        s = 'plurals.onePluralizedNum::' + n;
                        break;
                    default:
                        s =  'plurals.manyPluralizedNum::' + n;
                        break;
                    }
                    return s;
                },
                getPlurals: function () {
                    var n = $scope.pluralization.numCount,
                        s;
                    switch (n) {
                    case null:
                    case undefined:
                        s = '';
                        break;
                    case 0:
                        s = $filter('i18n')($scope.pluralization.options.zero);
                        break;
                    case 1:
                        s = $filter('i18n')('plurals.onePluralizedNum', n);
                        break;
                    default:
                        s = locale.getString('plurals.manyPluralizedNum', n);
                        break;
                    }
                    return s;
                },
                getWithOffs: function () {
                    var n = $scope.pluralization.numCount,
                        s;
                    switch(n) {
                    case 0:
                        s = $scope.pluralization.options.zero;
                        break;
                    case 1:
                        s = 'plurals.onePluralizedOfs';
                        break;
                    case 2:
                        s = locale.getString('plurals.twoPluralizedOfs', $scope.user.name);
                        break;
                    case 3:
                        s = locale.getString('plurals.threePluralizedOfs', $scope.user.name);
                        break;
                    default:
                        s = locale.getString('plurals.morePluralizedOfs', [$scope.user.name, (n - 2)]);
                        break;
                    }
                    return s;
                }
            };
        }
    ]);