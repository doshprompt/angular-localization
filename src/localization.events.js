angular.module('ngLocalize.Events', [])
    .constant('localeEvents', {
        resourceUpdates: 'ngLocalizeResourcesUpdated',
        localeChanges: 'ngLocalizeLocaleChanged'
    });