describe('service', function () {
    'use strict';

    angular.module('ngLocalize.InstalledLanguages')
        .value('localeSupported', [
            'en-US',
            'fr-FR',
        ]);

    beforeEach(module('ngLocalize', 'ngLocalize.InstalledLanguages', 'ngStorage', 'ngCookies'));

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

        it('should freeze bundle', inject(function (locale, localeEvents, $httpBackend) {
            $httpBackend.expectGET('languages/en-US/common.lang.json').respond(200, {
                "yes": "Yes"
            });

            $rootScope.$on(localeEvents.resourceUpdates, function (ev, data) {
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

    describe('persistence', function () {
        var french = 'fr-FR',
            english = 'en-US';
        it('should write to cookie', inject(function ($cookies, $window, locale, localeConf) {
            locale.setLocale(french);
            expect($cookies.get(localeConf.storageKey)).toBe(french);
            locale.setLocale(english);
            expect($cookies.get(localeConf.storageKey)).toBe(english);
        }));

        it('should write to session storage', inject(function ($cookies, $window, locale, localeConf, localeStorage) {
            // overwrite the default storaged
            localeStorage.module = '$sessionStorage';
            localeStorage.set = function (key, val) {
                this[key] = val;
                this.$apply();
            };
            localeStorage.get = function (key, val) {
                return this[key];
            };
            localeConf.storageType = 'session';
            locale.setLocale(french);
            expect($window.sessionStorage.getItem('ngStorage-' + localeConf.storageKey)).toMatch(new RegExp(french, 'i'));
            locale.setLocale(english);
            expect($window.sessionStorage.getItem('ngStorage-' + localeConf.storageKey)).toMatch(new RegExp(english, 'i'));
        }));

        it('should write to local storage', inject(function ($cookies, $window, locale, localeConf, localeStorage) {
            // overwrite the default storage
            localeStorage.module = '$localStorage';
            localeStorage.set = function (key, val) {
                this[key] = val;
                this.$apply();
            };
            localeStorage.get = function (key, val) {
                return this[key];
            };
            localeConf.storageType = 'local';
            locale.setLocale(french);
            expect($window.localStorage.getItem('ngStorage-' + localeConf.storageKey)).toMatch(new RegExp(french, 'i'));
            locale.setLocale(english);
            expect($window.localStorage.getItem('ngStorage-' + localeConf.storageKey)).toMatch(new RegExp(english, 'i'));
        }));
    });
});
