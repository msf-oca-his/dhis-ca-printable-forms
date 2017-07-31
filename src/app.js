window.TallySheets = angular.module('TallySheets', ['pascalprecht.translate', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ['$scope', 'DataSetService', 'DataSetProcessor', 'ProgramService', 'CoversheetProcessor',
	'RegisterProcessor', 'CustomAttributeValidationService', 'ExportToExcel', 'appLoadingFailed', 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes',
	'AlertTypesContract', 'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', '$q', 'CodeSheetProcessor', 'PageTypes', 'TemplatesToJsTreeNodesService',
	function($scope, DataSetService, DataSetProcessor, ProgramService, CoversheetProcessor, RegisterProcessor,
		CustomAttributeValidationService, ExportToExcel, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes,
		AlertTypesContract, InlineAlert, InlineAlertTypes, CustomAngularTranslateService, $q, CodeSheetProcessor, PageTypes, TemplatesToJsTreeNodesService) {

		$scope.appLoadingFailed = appLoadingFailed;
		$scope.spinnerShown = false;
		$scope.PageTypes = PageTypes;
		$scope.templatesType = '';
		$scope.nodes = [];
		$scope.inlineAlert = {
			message: '',
			type: '',
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

		var handleError = function(serviceError) {
			if(serviceError.severity == Severity.FATAL || serviceError.severity == Severity.ERROR) {
				var modalAlertType = AlertTypesContract.getModalAlert(serviceError);
				var closeOption = modalAlertType.isDismissible ? 'close' : 'go_to_home';
				CustomAngularTranslateService.getTranslation(closeOption).then(function(buttonText) {
					ModalAlertsService.showModalAlert(new ModalAlert(serviceError.message, modalAlertType, buttonText));
				});
			}
			else if(serviceError.severity == Severity.INFO || serviceError.severity == Severity.WARN) {
				var inlineAlertType = AlertTypesContract.getInlineAlert(serviceError);
				showInlineAlert(new InlineAlert(serviceError.message, inlineAlertType));
			}
			else {
				console.log(serviceError);   //must have console
				return CustomAngularTranslateService.getTranslation('unexpected_error').then(function(translatedMessage) {
					return CustomAngularTranslateService.getTranslation('close').then(function(buttonText) {
						return ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.dismissibleError, buttonText));
					});
				});
			}
			return $q.reject();
		};

		$scope.validationProcess = $q.when({})
			.then(CustomAttributeValidationService.validate)
			.catch(handleError);

		$scope.dsId = 1;
		$scope.templates = [];
		$scope.pages = [];
		$scope.exportToExcel = function(tableId) {
			ExportToExcel.process(tableId, $scope.pages[0].datasetName, $scope.pages[0].programName);
		};

		var processDataSets = function() {
			$scope.spinnerShown = true;
			$scope.programMode = null;
			return $q.all(_($scope.templates)
				.map('data')
				.map('id')
				.filter(_.negate(_.isEmpty))
				.map(DataSetService.getReferentialDataSetById)
				.value())
				.then(function(templates) {
					$scope.nodes = TemplatesToJsTreeNodesService.getJsTreeNodesFrom(templates);
					return templates;
				})
				.then(DataSetProcessor.process)
		};

		var processPrograms = function() {
			if($scope.programMode == null)
				return;
			$scope.spinnerShown = true;
			return $q.all(_($scope.templates)
				.map('data')
				.map('id')
				.filter(_.negate(_.isEmpty))
				.map(ProgramService.getProgramById)
				.value())
				.then(_.cloneDeep)
				.then(function(programs) {
					switch($scope.programMode) {
						case PageTypes.COVERSHEET :
							return CoversheetProcessor.process(_.cloneDeep(programs[0]));
							break;
						case PageTypes.REGISTER:
							return RegisterProcessor.process(_.cloneDeep(programs[0]));
							break;
						case PageTypes.CODESHEET:
							return CodeSheetProcessor.process(_.cloneDeep(programs[0]));
							break;
					}
				})
		};

		var addProcessedPagesToDOM = function(pages) {
			$scope.pages = pages;
			$scope.spinnerShown = false;
			setTimeout(function() {
				$scope.$apply();
			}, 1)
		};

		var processTemplates = function() {
			if($scope.selectedTemplatesType == PageTypes.DATASET)
				return $q.when().then(processDataSets);
			else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
				return $q.when().then(processPrograms);
			else return $q.when([]);
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
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
