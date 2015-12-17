angular.module('ngLocalize')
    .filter('i18n', function (locale) {
        var i18nFilter = function (input, args) {
            return locale.getString(input, args);
        };

        i18nFilter.$stateful = true;

        return i18nFilter;
    });
