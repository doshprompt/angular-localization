describe('directives', function () {
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
                fullName: 'My name is {firstName} {lastName}',
            });

            // force our service to pull down the required resource file
            $injector.get('locale').ready('common');
            _httpBackend.flush();
        });
    });

    afterEach(function() {
        _httpBackend.verifyNoOutstandingExpectation();
        _httpBackend.verifyNoOutstandingRequest();
    });

    describe('i18n', function () {
        it('should attach the localized version of a string', inject(function ($compile, $rootScope) {
            var element = $compile('<span data-i18n="common.helloWorld"></span>')($rootScope);
            $rootScope.$digest();
            expect(element.text()).toEqual('Hello World');
        }));

        it('should respect observable attributes', inject(function ($compile, $rootScope) {
            var element = angular.element(
                '<p data-first-name="Rahul" data-last-name="Doshi" data-i18n="common.fullName"></p>'
            );
            $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.text()).toEqual('My name is Rahul Doshi');
        }));

        it('should allow non-tokens to passthrough untouched and without errors', inject(function ($compile, $rootScope) {
            var element = angular.element(
                '<p data-i18n="notAToken"></p>'
            );
            $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.text()).toEqual('notAToken');
        }));
    });

    describe('i18nAttr', function () {
        it ('should localize the correct html attribute', inject(function ($compile, $rootScope) {
            var element = angular.element(
                '<input data-i18n-attr="{ placeholder: \'common.helloWorld\'}"></input>'
            );
            $compile(element)($rootScope);
            $rootScope.$digest();
            expect(element.attr('placeholder')).toEqual('Hello World');
        }));
    });
});