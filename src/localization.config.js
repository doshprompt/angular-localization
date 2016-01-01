angular.module('ngLocalize.Config', [])
    .value('localeConf', {
        basePath: 'languages',
        defaultLocale: 'en-US',
        sharedDictionary: 'common',
        fileExtension: '.lang.json',
        persistSelection: true,
        storageType: 'cookie',
        storageKey: 'LOCALE_LANG',
        observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
        delimiter: '::',
        validTokens: new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$')
    })
    .value('localeStorage', {
        module: '$cookies',
        set: function (key, val) {
            if (this.put) {
                this.put(key, val);
            } else {
                this[key] = val;
            }
        },
        get: function (key) {
            return this.get ? this.get(key) : this[key];
        }
    });
