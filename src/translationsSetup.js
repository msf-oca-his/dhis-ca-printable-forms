TallySheets.config(function($translateProvider) {
	$translateProvider.useSanitizeValueStrategy('escape'); //TODO: create a story to select sanitize strategy
	//#TODO: load translations preemptively in js rather than loading them at run time with a http call
	$translateProvider.useStaticFilesLoader({
		prefix: 'i18n/',
		suffix: '.json'
	});

	$translateProvider.registerAvailableLanguageKeys(
		['es', 'fr', 'en', 'pt'],
		{
			'en*': 'en',
			'es*': 'es',
			'fr*': 'fr',
			'pt*': 'pt',
			'*': 'en' // must be last!
		}
	);

	$translateProvider.fallbackLanguage(['en']);
	jQuery.ajax({ //TODO: this is a http call. if we are not using d2's translate then move this to d2
		url: ApiUrl + '/userSettings/keyUiLocale/',
		contentType: 'text/plain',
		method: 'GET',
		dataType: 'text',
		async: false
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