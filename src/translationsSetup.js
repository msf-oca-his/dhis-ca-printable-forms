TallySheets.config(['$translateProvider', 'uiLocaleProvider', function($translateProvider, uiLocaleProvider) {
	var languages = ['en', 'fr'];
	_.map(languages, function(language) {
		$translateProvider.translations(language, require('../i18n/' + language + '.js'));
	});

	$translateProvider.fallbackLanguage(['en']);
	$translateProvider.useSanitizeValueStrategy('sanitizeParameters');

	var uiLocale = uiLocaleProvider.$get();
	if(uiLocale == '')
		$translateProvider.determinePreferredLanguage();
	else
		$translateProvider.use(uiLocale);
}]);