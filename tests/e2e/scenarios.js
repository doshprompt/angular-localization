describe('my app', function() {
    'use strict';

    browser.get('index.html');

    it('should automatically redirect to /homw when location hash/fragment is empty', function() {
        expect(browser.getLocationAbsUrl()).toMatch("/home");
    });
});
