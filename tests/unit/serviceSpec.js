describe('service', function () {
    'use strict';

    beforeEach(module('ngLocalize'));

    describe('locale', function () {
        afterEach(inject(function($httpBackend) {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        }));

        it('should return current locale', inject(function (locale) {
            expect(locale.getLocale()).toBe('en-US');
        }));

        it('should go after the correct file', inject(function (locale, $httpBackend) {
            $httpBackend.expectGET('languages/en-US/common.lang.json').respond();
            locale.ready('common');
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
    });
});