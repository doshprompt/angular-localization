angular.module('ngLocalize.InstalledLanguages', [])
    .value('localeSupported', {
        'en-US': "English (United States)"
    })
    .value('localeFallbacks', {
        'en': 'en-US'
    });