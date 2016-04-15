describe('provider', function () {
    'use strict';
    beforeEach(module('ngLocalize'));

    describe('config', function () {
        var localeProvider;
        beforeEach(module(function (_localeProvider_) {
            localeProvider = _localeProvider_;
        }));

        it('should contain default properties', inject(function ($injector) {
            var locale = $injector.invoke(localeProvider.$get),
                configKeys = Object.keys(locale.getConfig());

                angular.copy(locale.getConfig());

            [
                'basePath',
                'defaultLocale',
                'sharedDictionary',
                'fileExtension',
                'persistSelection',
                'cookieName',
                'observableAttrs',
                'delimiter',
                'events',
                'supported',
                'fallbacks',
            ].forEach(function (prop) {
                expect(configKeys).toContain(prop);
            });
        }));

        it('should be overriden', inject(function ($injector) {
            var locale,
                override = {
                    basePath: 'langs',
                    defaultLocale: 'en-GB',
                    sharedDictionary: 'uncommon',
                    fileExtension: '.json',
                    persistSelection: false,
                    cookieName: 'COOKIE_LOCALE_LANG',
                    observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
                    delimiter: '**',
                    events: {
                        resourceUpdates: 'resourceUpdatesEvent',
                        localeChanges: 'localeChangesEvent',
                    },
                    supported: [
                        'en-GB'
                    ],
                    fallbacks: {
                        'en': 'en-GB'
                    }
                };

            localeProvider.init(override);

            locale = $injector.invoke(localeProvider.$get);

            angular.forEach(locale.getConfig(), function (val, key, config) {
                expect(config[key]).toEqual(override[key]);
            });
        }));
    });

    describe('locale', function () {
        var $rootScope;
        beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
        }));
        afterEach(inject(function($httpBackend) {
            $rootScope.$apply();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        }));

        it('should return current locale', inject(function (locale) {
            expect(locale.getLocale()).toBe('en-US');
        }));

        it('should go after the correct file', inject(function (locale, $httpBackend) {
            $httpBackend.expectGET('languages/en-US/common.lang.json').respond(200, {
                "yes": "Yes"
            });
            locale.ready('common').then(function() {
                expect(locale.getString('common.yes')).toBe('Yes');
            });
            $httpBackend.flush();
        }));

        it('should not error on calling setLocale with an invalid value', inject(function (locale) {
            locale.setLocale();
            expect(locale.getLocale()).toBe('en-US');
            locale.setLocale('abc123');
            expect(locale.getLocale()).toBe('en-US');
            locale.setLocale({});
            expect(locale.getLocale()).toBe('en-US');
            locale.setLocale('');
            expect(locale.getLocale()).toBe('en-US');
            locale.setLocale('  ');
            expect(locale.getLocale()).toBe('en-US');
        }));

        it('should validate tokens with whitespace', inject(function (locale) {
            expect(locale.isToken('test.hello world')).toBe(true);
        }));

        it('should update the lang attribute of the html tag', inject(function (locale) {
            locale.setLocale('en-US');
            expect(angular.element(document.body).parent().attr('lang')).toBe('en');
        }));

        it('should fail to retrieve non-existant lang file', inject(function (locale, $httpBackend) {
            var resp = 'lang file not found';
            $httpBackend.expectGET('languages/en-US/nonfound.lang.json').respond(404, resp);
            locale.ready('nonfound').then(function () {
                throw "Should not execute";
            }, function (err) {
                expect(err).toEqual(resp);
            });
            $httpBackend.flush();
        }));

        it('should fail to retrieve some non-existant lang files', inject(function (locale, $httpBackend) {
            var resp = 'lang file not found';
            $httpBackend.expectGET('languages/en-US/common.lang.json').respond(200, {
                "yes": "Yes"
            });
            $httpBackend.expectGET('languages/en-US/nonfound.lang.json').respond(404, resp);
            locale.ready(['common', 'nonfound']).then(function () {
                throw "Should not execute";
            }, function (err) {
                expect(err).toEqual(resp);
            });
            $httpBackend.flush();
        }));

        it('should freeze bundle', inject(function (locale, $httpBackend) {
            $httpBackend.expectGET('languages/en-US/common.lang.json').respond(200, {
                "yes": "Yes"
            });

            $rootScope.$on(locale.getConfig('events.resourceUpdates'), function (ev, data) {
                expect(data.path).toBe('common');
                expect(data.locale).toBe('en-US');
                expect(Object.isFrozen(data.bundle)).toBe(true);
            });
            locale.ready('common').then(function () {
                // noop
            }, function ()  {
                throw "Should not fail";
            });
            $httpBackend.flush();
        }));
    });
});
