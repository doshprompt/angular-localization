/*!
 * angular-localization :: v1.5.0 :: 2016-04-15
 * web: http://doshprompt.github.io/angular-localization
 *
 * Copyright (c) 2016 | Rahul Doshi
 * License: MIT
 */
;(function (angular, window, document, undefined) {
    'use strict';

angular.module('ngLocalize.Version', [])
    .constant('localeVer', '1.5.0');
angular.module('ngLocalize', ['ngSanitize', 'ngLocalize.Config', 'ngLocalize.Events', 'ngLocalize.InstalledLanguages']);

angular.module('ngLocalize.InstalledLanguages', [])
    .value('localeSupported', [
        'en-US'
    ])
    .value('localeFallbacks', {
        'en': 'en-US'
    });
angular.module('ngLocalize')
    .service('locale', ['$injector', '$http', '$q', '$log', '$rootScope', '$window', 'localeConf', 'localeEvents', 'localeSupported', 'localeFallbacks', function ($injector, $http, $q, $log, $rootScope, $window, localeConf, localeEvents, localeSupported, localeFallbacks) {
        var TOKEN_REGEX = localeConf.validTokens || new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$'),
            $html = angular.element(document.body).parent(),
            currentLocale,
            deferrences,
            bundles,
            cookieStore;

        if (localeConf.persistSelection && $injector.has('$cookieStore')) {
            cookieStore = $injector.get('$cookieStore');
        }

        function isToken(str) {
            return (str && str.length && TOKEN_REGEX.test(str));
        }

        function getPath(tok) {
            var path = tok ? tok.split('.') : '',
                result = '';

            if (path.length > 1) {
                result = path.slice(0, -1).join('.');
            }

            return result;
        }

        function getKey(tok) {
            var path = tok ? tok.split('.') : [],
                result = '';

            if (path.length) {
                result = path[path.length - 1];
            }

            return result;
        }

        function getBundle(tok) {
            var result = null,
                path = tok ? tok.split('.') : [],
                i;

            if (path.length > 1) {
                result = bundles;

                for (i = 0; i < path.length - 1; i++) {
                    if (result[path[i]]) {
                        result = result[path[i]];
                    } else {
                        result = null;
                        break;
                    }
                }
            }

            return result;
        }

        function isFrozen (obj) {
            return (Object.isFrozen || function (obj) {
                return obj && obj.$$frozen;
            })(obj);
        }

        function freeze (obj) {
            return (Object.freeze || function (obj) {
                if (obj) {
                    obj.$$frozen = true;
                }
            })(obj);
        }

        function loadBundle(token) {
            var path = token ? token.split('.') : '',
                root = bundles,
                parent,
                locale = currentLocale,
                url = localeConf.basePath + '/' + locale,
                ref,
                i;

            if (path.length > 1) {
                for (i = 0; i < path.length - 1; i++) {
                    ref = path[i];
                    if (!root[ref]) {
                        root[ref] = {};
                    }
                    parent = root;
                    root = root[ref];
                    url += '/' + ref;
                }

                if (isFrozen(root)) {
                    root = angular.extend({}, root);
                }
                if (!root._loading) {
                    root._loading = true;

                    url += localeConf.fileExtension;

                    $http.get(url)
                        .success(function (data) {
                            var key,
                                path = getPath(token);
                            // Merge the contents of the obtained data into the stored bundle.
                            for (key in data) {
                                if (data.hasOwnProperty(key)) {
                                    root[key] = data[key];
                                }
                            }

                            // Mark the bundle as having been "loaded".
                            delete root._loading;
                            parent[ref] = freeze(root);
                            root = null;

                            // Notify anyone who cares to know about this event.
                            $rootScope.$broadcast(localeEvents.resourceUpdates, {
                                locale: locale,
                                path: path,
                                bundle: parent[ref]
                            });

                            // If we issued a Promise for this file, resolve it now.
                            if (deferrences[path]) {
                                deferrences[path].resolve(path);
                            }
                        })
                        .error(function (err) {
                            var path = getPath(token);

                            $log.error('[localizationService] Failed to load: ' + url);

                            // We can try it again later.
                            delete root._loading;

                            // If we issued a Promise for this file, reject it now.
                            if (deferrences[path]) {
                                deferrences[path].reject(err);
                            }
                        });
                }
            }
        }

        function bundleReady(path) {
            var bundle,
                token;

            path = path || localeConf.langFile;
            token = path + '._LOOKUP_';

            bundle = getBundle(token);

            if (!deferrences[path]) {
                deferrences[path] = $q.defer();
            }

            if (bundle && !bundle._loading) {
                deferrences[path].resolve(path);
            } else {
                if (!bundle) {
                    loadBundle(token);
                }
            }

            return deferrences[path].promise;
        }

        function ready(path) {
            var paths,
                deferred,
                outstanding;

            if (angular.isString(path)) {
                paths = path.split(',');
            } else if (angular.isArray(path)) {
                paths = path;
            } else {
                throw new Error('locale.ready requires either an Array or comma-separated list.');
            }

            if (paths.length > 1) {
                outstanding = [];
                paths.forEach(function (path) {
                    outstanding.push(bundleReady(path));
                });
                deferred = $q.all(outstanding);
            } else {
                deferred = bundleReady(path);
            }

            return deferred;
        }

        function applySubstitutions(text, subs) {
            var res = text,
                firstOfKind = 0;

            if (subs) {
                if (angular.isArray(subs)) {
                    angular.forEach(subs, function (sub, i) {
                        res = res.replace('%' + (i + 1), sub);
                        res = res.replace('{' + (i + 1) + '}', sub);
                    });
                } else {
                    angular.forEach(subs, function (v, k) {
                        ++firstOfKind;

                        res = res.replace('{' + k + '}', v);
                        res = res.replace('%' + k, v);
                        res = res.replace('%' + (firstOfKind), v);
                        res = res.replace('{' + (firstOfKind) + '}', v);
                    });
                }
            }
            res = res.replace(/\n/g, '<br>');

            return res;
        }

        function getLocalizedString(txt, subs) {
            var result = '',
                bundle,
                key,
                A,
                isValidToken = false;

            if (angular.isString(txt) && !subs && txt.indexOf(localeConf.delimiter) !== -1) {
                A = txt.split(localeConf.delimiter);
                txt = A[0];
                subs = angular.fromJson(A[1]);
            }

            isValidToken = isToken(txt);
            if (isValidToken) {
                if (!angular.isObject(subs)) {
                    subs = [subs];
                }

                bundle = getBundle(txt);
                if (bundle && !bundle._loading) {
                    key = getKey(txt);

                    if (bundle[key]) {
                        result = applySubstitutions(bundle[key], subs);
                    } else {
                        $log.info('[localizationService] Key not found: ' + txt);
                        result = '%%KEY_NOT_FOUND%%';
                    }
                } else {
                    if (!bundle) {
                        loadBundle(txt);
                    }
                }
            } else {
                result = txt;
            }

            return result;
        }

        function updateHtmlTagLangAttr(lang) {
            lang = lang.split('-')[0];

            $html.attr('lang', lang);
        }

        function getLanguageSupported(language) {
            var foundLanguage = null;
            if (language && language.length) {
                localeSupported.forEach(function (languageSuppported) {
                    if (languageSuppported.indexOf(language) === 0) {
                        foundLanguage = languageSuppported;
                        return;
                    }
                });
                if (!foundLanguage) {
                    var fallbackLang = localeFallbacks[language.split('-')[0]];
                    if (!angular.isUndefined(fallbackLang)) {
                      foundLanguage = fallbackLang;
                    }
                }
            }
            return foundLanguage || localeConf.defaultLocale;
        }

        function setLocale(value) {
            var lang;

            if (angular.isString(value) && value.length ) {
                value = value.trim();
                lang = getLanguageSupported(value);
            } else {
                lang = localeConf.defaultLocale;
            }

            if (lang !== currentLocale) {
                bundles = {};
                deferrences = {};
                currentLocale = lang;

                updateHtmlTagLangAttr(lang);

                $rootScope.$broadcast(localeEvents.localeChanges, currentLocale);

                if (cookieStore) {
                    cookieStore.put(localeConf.cookieName, lang);
                }
            }
        }

        function getLocale() {
            return currentLocale;
        }

        function getPreferredBrowserLanguage() {
            var nav = $window.navigator,
                browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
                i,
                language;

            // support for HTML 5.1 "navigator.languages"
            if (angular.isArray(nav.languages)) {
                for (i = 0; i < nav.languages.length; i++) {
                    language = nav.languages[i];
                    if (language) {
                        return language;
                    }
                }
            }
            // support for other well known properties in browsers
            for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
                language = nav[browserLanguagePropertyKeys[i]];
                if (language) {
                    return language;
                }
            }

            return null;
        }

        function initialSetLocale() {
            setLocale(cookieStore && cookieStore.get(localeConf.cookieName) ?
                cookieStore.get(localeConf.cookieName) :
                getPreferredBrowserLanguage());
        }

        initialSetLocale();

        return {
            ready: ready,
            isToken: isToken,
            getPath: getPath,
            getKey: getKey,
            setLocale: setLocale,
            getLocale: getLocale,
            getString: getLocalizedString,
            getPreferredBrowserLanguage: getPreferredBrowserLanguage
        };
    }]);

angular.module('ngLocalize')
    .filter('i18n', ['locale', function (locale) {
        var i18nFilter = function (input, args) {
            return locale.getString(input, args);
        };

        i18nFilter.$stateful = true;

        return i18nFilter;
    }]);

angular.module('ngLocalize.Events', [])
    .constant('localeEvents', {
        resourceUpdates: 'ngLocalizeResourcesUpdated',
        localeChanges: 'ngLocalizeLocaleChanged'
    });
angular.module('ngLocalize')
    .directive('i18n', ['$sce', 'locale', 'localeEvents', 'localeConf', function ($sce, locale, localeEvents, localeConf) {
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
    }])
    .directive('i18nAttr', ['$rootScope', 'locale', 'localeEvents', function ($rootScope, locale, localeEvents) {
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
    }]);

angular.module('ngLocalize.Config', [])
    .value('localeConf', {
        basePath: 'languages',
        defaultLocale: 'en-US',
        sharedDictionary: 'common',
        fileExtension: '.lang.json',
        persistSelection: true,
        cookieName: 'COOKIE_LOCALE_LANG',
        observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
        delimiter: '::',
        validTokens: new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$')
    });

}(this.angular, this, this.document));
