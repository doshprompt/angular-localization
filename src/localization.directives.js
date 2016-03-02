angular.module('ngLocalize')
    .directive('i18n', function ($sce, locale, localeEvents, localeConf) {
        function setText(elm, tag) {
            if (tag !== elm.html()) {
                elm.html($sce.getTrustedHtml(tag));
            }
        }

        function update(elm, string, optArgs) {
            if (locale.isToken(string)) {
                locale.ready(locale.getPath(string)).then(function () {
                    setText(elm, locale.getString(string, optArgs));
                });
            } else {
                setText(elm, string);
            }
        }

        return function (scope, elm, attrs) {
            var hasObservers;

            attrs.$observe('i18n', function (newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    update(elm, newVal, hasObservers);
                }
            });

            angular.forEach(attrs.$attr, function (attr, normAttr) {
                if (localeConf.observableAttrs.test(attr)) {
                    attrs.$observe(normAttr, function (newVal) {
                        if (newVal || !hasObservers || !hasObservers[normAttr]) {
                            hasObservers = hasObservers || {};
                            hasObservers[normAttr] = attrs[normAttr];
                            update(elm, attrs.i18n, hasObservers);
                        }
                    });
                }
            });

            scope.$on(localeEvents.resourceUpdates, function () {
                update(elm, attrs.i18n, hasObservers);
            });
            scope.$on(localeEvents.localeChanges, function () {
                update(elm, attrs.i18n, hasObservers);
            });
        };
    })
    .directive('i18nAttr', function ($rootScope, locale, localeEvents) {
        function setAttr ($attrs, key, value) {
            $attrs.$set($attrs.$normalize(key), value);
        }

        function getUpdateText ($scope, target, $attrs) {
            var lastValues = {};
            return function (attributes) {
                var values = $scope.$eval(attributes),
                    langFiles = [],
                    exp;

                for(var key in values) {
                    exp = values[key];
                    if (locale.isToken(exp) && langFiles.indexOf(locale.getPath(exp)) === -1) {
                        langFiles.push(locale.getPath(exp));
                    }
                }

                locale.ready(langFiles).then(function () {
                    var value = '';
                    for(var key in values) {
                        exp = values[key];
                        value = locale.getString(exp);
                        if (lastValues[key] !== value) {
                            lastValues[key] = value;
                            setAttr($attrs, key, value);
                        }
                    }
                });
            };
        }

        return {
            // ensure has higher priority than ngAria
            priority: 1000,
            compile: function ($elem, $attrs) {
                angular.forEach($rootScope.$eval($attrs.i18nAttr), function (value, key) {
                    // temporarily populate attribute
                    // avoid false positive warning about aria-label
                    setAttr($attrs, key, value || '...');
                });

                return function ($scope, $elem, $attrs) {
                    var updateText = getUpdateText($scope, $elem, $attrs);

                    $attrs.$observe('i18nAttr', function (newVal) {
                        if (newVal) {
                            updateText(newVal);
                        }
                    });

                    $scope.$on(localeEvents.resourceUpdates, function () {
                        updateText($attrs.i18nAttr);
                    });

                    $scope.$on(localeEvents.localeChanges, function () {
                        updateText($attrs.i18nAttr);
                    });
                };
            }
        };
    });
