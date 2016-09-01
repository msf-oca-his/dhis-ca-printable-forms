require('./boot.js');
TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ["$scope", "DataSetService", "DataSetProcessor", "ProgramService", "CoversheetProcessor", "RegisterProcessor", "CustomAttributeValidationService", "appLoadingFailed", function($scope, DataSetService, DataSetProcessor, ProgramService, CoversheetProcessor, RegisterProcessor, CustomAttributeValidationService, appLoadingFailed) {

	$scope.appLoadingFailed = appLoadingFailed;
	$scope.spinnerShown = false;
	if(appLoadingFailed) return;
	$scope.validationProcess = CustomAttributeValidationService.validate();
	$scope.dsId = 1;
	$scope.template = {};
	$scope.pages = [];
	$scope.exportToTable = function(tableId) {
		var uri      = 'data:application/vnd.ms-excel;base64,'
			, template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
			'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' +
			'<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}' +
			'</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>' +
			'</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
			, base64   = function(s) {
			return window.btoa(unescape(encodeURIComponent(s)))
		}
			, format   = function(s, c) {
			return s.replace(/{(\w+)}/g, function(m, p) {
				return c[p];
			})
		}

		var table = $("#" + tableId).clone();

		// Remove non-printable section from the table
		table.find(".hidden-print").remove();

		// Replace input fields with their values (for correct excel formatting)
		table.find("input").each(function() {
			var value = $(this).val();
			$(this).replaceWith(value);
		});

		// Add border to section table (for printing in MS Excel)
		table.find(".sectionTable").prop('border', '1');

		// Take the name of the first dataset as filename
		var name = table.find("h2").first().html() + '.xls';

		var ctx = {worksheet: 'MSF-OCBA HMIS' || 'Worksheet', table: table.html()}

		// Create a fake link to download the file
		var link = angular.element('<a class="hidden" id="idlink"></a>');
		link.attr({
			href: uri + base64(format(template, ctx)),
			target: '_blank',
			download: name
		});
		$("body").prepend(link[0].outerHTML);
		$("#idlink")[0].click();
		$("#idlink")[0].remove();

	};

	// Initialize the app with one dataSet selector
	var loadAndProcessSelectedTemplate = function() {
		$scope.spinnerShown = true;
		if($scope.template.type == "DATASET") {
			$scope.programMode = null;
			return DataSetService.getReferentialDataSet($scope.template.id)
				.then(function(dataSet) {
					return DataSetProcessor.process(dataSet);
				});
		}
		else if($scope.template.type == "PROGRAM" && $scope.programMode) {
				return ProgramService.getProgram($scope.template.id)
					.then(function(program) {
						return $scope.programMode == "COVERSHEET" ? CoversheetProcessor.process(_.cloneDeep(program)) : RegisterProcessor.process(_.cloneDeep(program));
					});
		}
		else return Promise.resolve([]);
	};
	var addProcessedPagesToDOM = function(pages) {
		$scope.pages = pages;
		$scope.spinnerShown = false;
		$scope.$apply();
	};

	$scope.renderTemplates = function(template) {
		$scope.pages = [];
		$scope.template = template ? template : $scope.template;
		if(!$scope.template.id) return;
		loadAndProcessSelectedTemplate()
			.then(addProcessedPagesToDOM);
	};
}]);

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
