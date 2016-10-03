window.TallySheets = angular.module('TallySheets', ['ngResource', 'pascalprecht.translate', 'ngRoute', 'ngCookies', 'd2HeaderBar', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ["$scope", "DataSetService", "DataSetProcessor", "ProgramService", "CoversheetProcessor", "RegisterProcessor", "CustomAttributeValidationService", "appLoadingFailed", 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes', 'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', function($scope, DataSetService, DataSetProcessor, ProgramService, CoversheetProcessor, RegisterProcessor, CustomAttributeValidationService, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes, InlineAlert, InlineAlertTypes, CustomAngularTranslateService) {

	$scope.appLoadingFailed = appLoadingFailed;
	document.querySelector('#app').classList.remove('hidden');
	$scope.spinnerShown = false;
	$scope.inlineAlert = {
		message:'',
		type:'',
		shown: false
	};

	if(appLoadingFailed) return;

	var showInlineAlert = function(inlineAlert) {
		$scope.inlineAlert.message = inlineAlert.message;
		$scope.inlineAlert.type = inlineAlert.type;
		$scope.inlineAlert.shown = true;
		setTimeout(function() {
			$scope.inlineAlert.shown = false;
			$scope.$apply();
		}, 5000);
	};

	var handleError = function(alertObject) {
		if(alertObject.constructor.name == 'ModalAlert')
			ModalAlertsService.showModalAlert(alertObject);
		else if(alertObject.constructor.name == 'InlineAlert')
			showInlineAlert(alertObject);
		else{
			console.log(alertObject); //must have console
			return CustomAngularTranslateService.getTranslation('unexpected_error').then(function(translatedMessage) {
				return ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.dismissibleError));
			})
		}
		return Promise.reject();
	};

	var onValidationFail = function(alertObject) {
		if(alertObject.constructor.name =='ModalAlert' && (alertObject.type == ModalAlertTypes.indismissibleError || alertObject.type == ModalAlertTypes.indismissibleWarning)) {
			return handleError(alertObject);
		}
		else{
			handleError(alertObject);
			return Promise.reject(alertObject);
		}
	};

	$scope.validationProcess = Promise.resolve({})
		.then(CustomAttributeValidationService.validate)
		.catch(onValidationFail);

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
			return Promise.resolve($scope.template.id)
				.then(DataSetService.getReferentialDataSet)
				.then(DataSetProcessor.process, function() {
					return CustomAngularTranslateService.getTranslation('DOWNLOAD_DATASETS_FAILED')
						.then(function(translatedMessage) {
							return Promise.reject(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
						})
				})
				.catch(function(){
					return CustomAngularTranslateService.getTranslation('PROCESS_DATASETS_FAILED')
						.then(function(translatedMessage) {
							return Promise.reject(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
						})
				})
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
		Promise.resolve()
			.then(loadAndProcessSelectedTemplate)
			.then(addProcessedPagesToDOM)
			.catch(handleError);
	};
}]);
