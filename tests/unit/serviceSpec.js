describe('service', function () {
    'use strict';

    beforeEach(module('ngLocalize'));

    describe('locale', function () {
        var $rootScope,
            mockWindow,
            localeConf;

        // Mock $window
        beforeEach(module(function ($provide) {
            mockWindow = { navigator : {
                languages: []
            }};
            $provide.value('$window', mockWindow);
        }));

        beforeEach(inject(function (_$rootScope_, _localeConf_) {
            $rootScope = _$rootScope_;
            localeConf = _localeConf_;
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

        it('should get preferred browser language', inject(function (locale, $window) {
            $window.navigator.languages = [];
            expect(locale.getPreferredBrowserLanguage()).toBe(null);

            $window.navigator.languages = ['sv-SE', 'de-DE'];
            expect(locale.getPreferredBrowserLanguage()).toBe('sv-SE');

            $window.navigator.languages = ['de-DE', 'sv-SE'];
            expect(locale.getPreferredBrowserLanguage()).toBe('de-DE');

            $window.navigator = {language: 'ab-CD'};
            expect(locale.getPreferredBrowserLanguage()).toBe('ab-CD');

            $window.navigator = {browserLanguage: 'ab-CD'};
            expect(locale.getPreferredBrowserLanguage()).toBe('ab-CD');

            $window.navigator = {systemLanguage: 'ab-CD'};
            expect(locale.getPreferredBrowserLanguage()).toBe('ab-CD');

            $window.navigator = {userLanguage: 'ab-CD'};
            expect(locale.getPreferredBrowserLanguage()).toBe('ab-CD');
        }));

        describe('token validation', function(){
            it('should validate tokens with whitespace', inject(function (locale) {
                expect(locale.isToken('test.hello world')).toBe(true);
            }));
            it('should allow only word letters as first character', inject(function(locale){
                expect(locale.isToken('/common.hello')).toBe(false);
                expect(locale.isToken('common.hello')).toBe(true);
            }));
            it('should allow forward slashes before the first dot', inject(function(locale){
                expect(locale.isToken('common/folder1/folder2/file.hello')).toBe(true);
            }));
            it('should forbid forward slashes after the first dot', inject(function(locale){
                expect(locale.isToken('common/folder1.folder2/file.hello')).toBe(false);
            }));
            it('should validate tokens with multiple dots', inject(function(locale){
                expect(locale.isToken('common/folder1/folder2/file.nested.json.object.hello')).toBe(true);
            }));
            it('should validate tokens without forward slashes', inject(function(locale){
                expect(locale.isToken('common.folder1.folder2.file.hello')).toBe(true);
            }));
            it('should invalidate tokens without letters between forward slashes or dots', inject(function(locale){
                expect(locale.isToken('common/.folder1')).toBe(false);
            }));
            it('should invalidate tokens without letters between forward slashes or dots', inject(function(locale){
                expect(locale.isToken('common..folder1')).toBe(false);
            }));
        });

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

        describe('when allowing nested json', function(){
            beforeEach(function(){
                localeConf.allowNestedJson = true;
            });

            it('should use forward slashes instead of dots to navigate the file system', inject(function(locale, $httpBackend){
                $httpBackend.expectGET('languages/en-US/common/folder1/folder2/file.lang.json').respond(200, {
                    "yes": "Yes"
                });
                locale.ready('common/folder1/folder2/file').then(function() {
                    expect(locale.getString('common/folder1/folder2/file.yes')).toBe('Yes');
                });
                $httpBackend.flush();
            }));

            it('should treat dots as object property delimiters and return the deeply nested string', inject(function(locale, $httpBackend){
                $httpBackend.expectGET('languages/en-US/common/folder1/folder2/file.lang.json').respond(200, {
                    "nested": {
                        "json": {
                            "object": {
                                "yes": "Yes"
                            }
                        }
                    }
                });
                locale.ready('common/folder1/folder2/file').then(function() {
                    expect(locale.getString('common/folder1/folder2/file.nested.json.object.yes')).toBe('Yes');
                });
                $httpBackend.flush();
            }));

            it('should return %%KEY_NOT_STRING%% when the nested property is not a string', inject(function(locale, $httpBackend){
                $httpBackend.expectGET('languages/en-US/common/folder1/folder2/file.lang.json').respond(200, {
                    "nested": {
                        "json": {
                            "object": {
                                "yes": "Yes"
                            }
                        }
                    }
                });
                locale.ready('common/folder1/folder2/file').then(function() {
                    expect(locale.getString('common/folder1/folder2/file.nested.json')).toBe('%%KEY_NOT_STRING%%');
                });
                $httpBackend.flush();
            }));
        });

        describe('when not allowing nested json', function(){
            beforeEach(function(){
                localeConf.allowNestedJson = false;
            });

            it('should treat forward slashes as dots to navigate the file system', inject(function(locale, $httpBackend){
                $httpBackend.expectGET('languages/en-US/common/folder1/folder2/file.lang.json').respond(200, {
                    "yes": "Yes"
                });
                locale.ready('common/folder1/folder2/file').then(function() {
                    expect(locale.getString('common/folder1/folder2/file.yes')).toBe('Yes');
                });
                $httpBackend.flush();
            }));

            it('should only use the last part of the token as a key', inject(function(locale, $httpBackend){
                $httpBackend.expectGET('languages/en-US/common/folder1/folder2/file/not/nested/json/object.lang.json').respond(200, {
                    "yes": "Yes"
                });
                locale.ready('common.folder1.folder2.file.not.nested.json.object').then(function() {
                    expect(locale.getString('common/folder1/folder2/file.not.nested.json.object.yes')).toBe('Yes');
                });
                $httpBackend.flush();
            }));
        });
    });
});
