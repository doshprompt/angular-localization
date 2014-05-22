angular.module('ngLocalize.InstalledLanguages', [])
    .value('localeSupported', [
        'en-US'
    ])
    .value('localeFallbacks', {
        'en': 'en-US'
    });