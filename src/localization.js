angular.module('ngLocalize')
    .provider('locale', function () {
        var TOKEN_REGEX = new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$'),
            localeConf = {
                basePath: 'languages',
                defaultLocale: 'en-US',
                sharedDictionary: 'common',
                fileExtension: '.lang.json',
                persistSelection: true,
                cookieName: 'COOKIE_LOCALE_LANG',
                observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
                delimiter: '::',
                events: {
                    resourceUpdates: 'ngLocalizeResourcesUpdated',
                    localeChanges: 'ngLocalizeLocaleChanged',
                },
                supported: [
                    'en-US'
                ],
                fallbacks: {
                    'en': 'en-US'
                }
            };

        function getConfig (str) {
            var ref = localeConf;
            if (angular.isString(str)) {
                angular.forEach(str.split('.'), function (s) {
                    ref = ref[s];
                });
                return ref;
            }
            return localeConf;
        }
        this.getConfig = getConfig;

        function getVersion () {
            return '/* @echo VERSION */';
        }
        this.getVersion = getVersion;

        function getSupportedLocales () {
            return localeConf.supported;
        }
        this.getSupportedLocales = getSupportedLocales;

        function getEvents () {
            return localeConf.events;
        }
        this.getEvents = getEvents;

        this.init = function(cfg) {
            angular.merge(localeConf, cfg);
        };

        this.$get = function ($injector, $http, $q, $log, $rootScope, $window) {
            var $html = angular.element(document.body).parent(),
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
                                $rootScope.$broadcast(localeConf.events.resourceUpdates, {
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

            function setLocale(value) {
                var lang;

                if (angular.isString(value)) {
                    value = value.trim();
                    if (localeConf.supported.indexOf(value) !== -1) {
                        lang = value;
                    } else {
                        lang = localeConf.fallbacks[value.split('-')[0]];
                        if (angular.isUndefined(lang)) {
                            lang = localeConf.defaultLocale;
                        }
                    }
                } else {
                    lang = localeConf.defaultLocale;
                }

                if (lang !== currentLocale) {
                    bundles = {};
                    deferrences = {};
                    currentLocale = lang;

                    updateHtmlTagLangAttr(lang);

                    $rootScope.$broadcast(localeConf.events.localeChanges, currentLocale);

                    if (cookieStore) {
                        cookieStore.put(localeConf.cookieName, lang);
                    }
                }
            }

            function getLocale() {
                return currentLocale;
            }

            setLocale(cookieStore && cookieStore.get(localeConf.cookieName) ? cookieStore.get(localeConf.cookieName) : $window.navigator.userLanguage || $window.navigator.language);

            return {
                ready: ready,
                isToken: isToken,
                getPath: getPath,
                getKey: getKey,
                setLocale: setLocale,
                getLocale: getLocale,
                getString: getLocalizedString,
                getConfig: getConfig,
                getSupportedLocales: getSupportedLocales,
                getEvents: getEvents,
                getVersion: getVersion
            };
        };
    });
