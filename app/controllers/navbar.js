angular.module('ngLocalize.docs.navbar')
    .controller('NavControl', ['$scope', 'locale', 'localeSupported', 'localeEvents',
        function ($scope, locale, localeSupported, localeEvents) {
            'use strict';

            $scope.supportedLang = localeSupported;
            $scope.localeData = {
                'en-US': {
                    flagClass: 'flag-us',
                    langDisplayText: 'English'
                },
                'fr-FR': {
                    flagClass: 'flag-fr',
                    langDisplayText: 'Français'
                }
            };

            $scope.setLocale = function (loc) {
                locale.setLocale(loc);
            };

            locale.ready('common').then(function () {
                $scope.flagClass = $scope.localeData[locale.getLocale()].flagClass;
                $scope.langDisplayText = $scope.localeData[locale.getLocale()].langDisplayText;
            });

            $scope.$on(localeEvents.localeChanges, function (event, data) {
                $scope.flagClass = $scope.localeData[data].flagClass;
                $scope.langDisplayText = $scope.localeData[data].langDisplayText;
            });
        }
    ]);