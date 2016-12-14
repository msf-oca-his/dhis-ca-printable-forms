window.TallySheets = angular.module('TallySheets', ['ngResource', 'pascalprecht.translate', 'ngRoute', 'ngCookies', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ["$scope", "DataSetService", "DataSetProcessor", "ProgramService", "CoversheetProcessor",
	"RegisterProcessor", "CustomAttributeValidationService", "appLoadingFailed", 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes','AlertTypes',
	'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', '$q', "CodeSheetProcessor","PageTypes",
	function($scope, DataSetService, DataSetProcessor, ProgramService, CoversheetProcessor, RegisterProcessor,
	         CustomAttributeValidationService, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes, AlertTypes,
	         InlineAlert, InlineAlertTypes, CustomAngularTranslateService, $q, CodeSheetProcessor,PageTypes) {

	$scope.appLoadingFailed = appLoadingFailed;
	$scope.spinnerShown = false;
		$scope.PageTypes = PageTypes;
	$scope.templatesType = '';
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
	var throwError = function(message, type){
		return CustomAngularTranslateService.getTranslation(message).then(function(translatedMessage) {
			return ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, type));
		})
	};
	var handleError = function(alertObject) {

		if(alertObject.severity == Severity.FATAL || alertObject.severity == Severity.ERROR) {
			ModalAlertsService.showModalAlert(AlertTypes.renderModelAlert(alertObject));
		}
		else if(alertObject.severity == Severity.INFO || alertObject.severity == Severity.WARN)
			showInlineAlert(AlertTypes.renderInlineAlert(alertObject));
		else{
			console.log(alertObject); //must have console
			return throwError('unexpected_error', ModalAlertTypes.dismissibleError);
		}
		return $q.reject();
	};

	$scope.validationProcess = $q.when({})
		.then(CustomAttributeValidationService.validate)
		.catch(handleError);

	$scope.dsId = 1;
	$scope.templates = [];
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
		};

		var table = $("#" + tableId).clone();

		// Remove non-printable section from the table
		table.find('.hidden-print').remove();
		table.find('.noprint').remove();
		table.find('link').remove();
		
		// Take the name of the first dataset as filename
		var xlsName = ($scope.pages[0].datasetName) ? $scope.pages[0].datasetName : $scope.pages[0].programName;
		var name = xlsName + '.xls';

		var ctx = {worksheet: 'MSF-OCBA HMIS' || 'Worksheet', table: table.html()};

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

	var processDataSets = function(){
		$scope.spinnerShown = true;
		$scope.programMode = null;
		return $q.all(_($scope.templates)
			              .map('id')
			              .filter(_.negate(_.isEmpty))
			              .map(DataSetService.getReferentialDataSet)
			              .value())
						.then(DataSetProcessor.process)
	};
	var processPrograms = function(){
		if($scope.programMode == null)
			return;
		$scope.spinnerShown = true;
		return $q.all(_($scope.templates)
			       .map('id')
             .filter(_.negate(_.isEmpty))
             .map(ProgramService.getProgram)
             .value())
						.then(_.cloneDeep)
						.then(function(programs){
							switch($scope.programMode) {
								case PageTypes.COVERSHEET : return CoversheetProcessor.process(_.cloneDeep(programs[0])); break;
								case PageTypes.REGISTER: return RegisterProcessor.process(_.cloneDeep(programs[0])); break;
								case PageTypes.CODESHEET: return  CodeSheetProcessor.process(_.cloneDeep(programs[0])); break;
							}
						})
	};

	var addProcessedPagesToDOM = function(pages) {
		$scope.pages = pages;
		$scope.spinnerShown = false;
		setTimeout(function(){
			$scope.$apply();
		},1)
	};

	var processTemplates = function() {
		if($scope.selectedTemplatesType == PageTypes.DATASET)
			return $q.when().then(processDataSets);
		else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
			return $q.when().then(processPrograms);
		else return $q.when([]);
	};

	$scope.renderTemplates = function(templates) {
		$scope.pages = [];
		$scope.templates = templates ? templates : $scope.templates;
		$q.when()
			.then(processTemplates)
			.then(addProcessedPagesToDOM)
			.catch(handleError);
	};
}]);
