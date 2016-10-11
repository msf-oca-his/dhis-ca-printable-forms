TallySheets.config(function($translateProvider) {
	$translateProvider.useSanitizeValueStrategy('escape'); //TODO: create a story to select sanitize strategy

	$translateProvider.translations('en', require('../i18n/en.js'));
	$translateProvider.translations('es', require('../i18n/es.js'));
	$translateProvider.translations('fr', require('../i18n/fr.js'));
	$translateProvider.translations('pt', require('../i18n/pt.js'));

	$translateProvider.fallbackLanguage(['en']);
	jQuery.ajax({
		url: ApiUrl + '/userSettings/keyUiLocale/',
		contentType: 'text/plain',
		method: 'GET',
		dataType: 'text',
	}).done(function(uiLocale) {
		if(uiLocale == '') {
			$translateProvider.determinePreferredLanguage();
		}
		else {
			$translateProvider.use(uiLocale);
		}
	}).fail(function() {
		$translateProvider.determinePreferredLanguage();
	});

});