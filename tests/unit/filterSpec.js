describe('filter', function () {
    'use strict';

    var _httpBackend;

    beforeEach(function () {
        module('ngLocalize');

        inject(function ($injector) {
            // Set up the mock http service responses
            _httpBackend = $injector.get('$httpBackend');
            // backend definition common for all tests
            _httpBackend.whenGET('languages/en-US/common.lang.json').respond({
                helloWorld: 'Hello World',
                version: 'v%1',
                fullName: 'My name is {firstName} {lastName}',
                versionAlt: 'v%major.%minor.%patch',
                fullNameAlt: 'My name is {1} {2}',
                'key with whitespace': 'valuewithoutwhitespace',
                'fullNameDups': 'My full name is {firstName} {lastName} so my "good name" is {firstName}.'
            });
        });
    });

    describe('i18n', function () {
        beforeEach(inject(function (locale) {
            // force our service to pull down the required resource file
            locale.ready('common');
            _httpBackend.flush();
        }));

        afterEach(function() {
            _httpBackend.verifyNoOutstandingExpectation();
            _httpBackend.verifyNoOutstandingRequest();
        });

        it('should return the localized version of a string', inject(function (i18nFilter) {
            expect(i18nFilter('common.helloWorld')).toEqual('Hello World');
        }));

        it('should apply the correct substitutions -- %n', inject(function (i18nFilter) {
            expect(i18nFilter('common.version', 1)).toEqual('v1');
        }));

        it('should apply the correct substitutions -- {prop}', inject(function (i18nFilter) {
            expect(i18nFilter('common.fullName', {
                firstName: 'John',
                lastName: 'Smith'
            })).toEqual('My name is John Smith');
        }));

        it('should apply the correct substitutions -- %prop', inject(function (i18nFilter) {
            expect(i18nFilter('common.versionAlt', {
                major: 1,
                minor: 0,
                patch: 0
            })).toEqual('v1.0.0');
        }));

        it('should apply the correct substitutions -- {n}', inject(function (i18nFilter) {
            expect(i18nFilter('common.fullNameAlt', [
                'John',
                'Smith'
            ])).toEqual('My name is John Smith');
        }));

        it('should handle the special case', inject(function (i18nFilter) {
            expect(i18nFilter('common.version::1')).toEqual('v1');
        }));

        it('should allow tokens with whitespace', inject(function (i18nFilter) {
            expect(i18nFilter('common.key with whitespace')).toEqual('valuewithoutwhitespace');
        }));

        it('should substitute all occourences of a token', inject(function (i18nFilter) {
            expect(i18nFilter('common.fullNameDups', {
                firstName: 'John',
                lastName: 'Smith'
            })).toEqual('My full name is John Smith so my "good name" is John.');
        }));
    });
});