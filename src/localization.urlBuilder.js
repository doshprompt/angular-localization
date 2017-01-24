angular.module('ngLocalize.UrlBuilder', [])
    .value('urlBuilder', { 
		build: function(basePath, locale, refs, fileExtension) {
			if (!angular.isArray(refs))
				refs = [refs];
			
			var delimiter = '/';
			
			return basePath 
			+ delimiter + locale 
			+ delimiter + refs.join(delimiter)
			+ fileExtension;
		}
	});