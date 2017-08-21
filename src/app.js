window.TallySheets = angular.module('TallySheets', ['pascalprecht.translate', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ['$scope', 'DataSetService', 'DataSetProcessor', 'ProgramService', 'CoversheetProcessor',
	'RegisterProcessor', 'CustomAttributeValidationService', 'ExportToExcel', 'appLoadingFailed', 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes',
	'AlertTypesContract', 'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', '$q', 'CodeSheetProcessor', 'PageTypes', 'TemplateCustomizationService',
	function($scope, DataSetService, DataSetProcessor, ProgramService, CoversheetProcessor, RegisterProcessor,
		CustomAttributeValidationService, ExportToExcel, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes,
		AlertTypesContract, InlineAlert, InlineAlertTypes, CustomAngularTranslateService, $q, CodeSheetProcessor, PageTypes, TemplateCustomizationService) {

		$scope.appLoadingFailed = appLoadingFailed;
		$scope.spinnerShown = false;
		$scope.PageTypes = PageTypes;
		$scope.templatesCustomizations = [];
		$scope.templatesType = '';
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

		$scope.templates = [];
		$scope.pages = [];
		$scope.exportToExcel = function(tableId) {
			ExportToExcel.process(tableId, $scope.pages[0].datasetName, $scope.pages[0].programName);
		};

		var processDataSets = function(dataSets) {
			$scope.spinnerShown = true;
			$scope.programMode = null;
			return DataSetProcessor.process(dataSets);
		};
    var processPrograms = function(programs) {
			if($scope.programMode == null)
				return;
			$scope.spinnerShown = true;
					switch($scope.programMode) {
						case PageTypes.COVERSHEET :
							return CoversheetProcessor.process(_.cloneDeep(programs[0]));
						case PageTypes.REGISTER:
							return RegisterProcessor.process(_.cloneDeep(programs[0]));
						case PageTypes.CODESHEET:
							return CodeSheetProcessor.process(_.cloneDeep(programs[0]));
					}
		};

		var addProcessedPagesToDOM = function(pages) {
			$scope.pages = pages;
			$scope.spinnerShown = false;
			setTimeout(function() {
				$scope.$apply();
			}, 1)
		};

		var processTemplates = function(templates) {
			if($scope.selectedTemplatesType == PageTypes.DATASET)
				return processDataSets(templates);
			else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
				return processPrograms(templates);
			else return [];
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
		};

		$scope.onTemplateSelectionChanged = function(templates, action, position) {
			$scope.pages = [];
			$scope.templates = templates;
			$scope.renderTemplates();
			$scope.$broadcast('templatesSelectionChanged', templates, action, position);
    };
		var customizeTemplates = function(templates){
			if(_.isEmpty($scope.templatesCustomizations))
				return templates;
      return TemplateCustomizationService.customizeTemplates(templates, $scope.templatesCustomizations, $scope.selectedTemplatesType);
		};
		var getTemplatesFromDHIS = function(){
			var templateIds = _($scope.templates)
													.map('data.id')
													.map(_.cloneDeep)
													.value();
			if($scope.selectedTemplatesType == PageTypes.DATASET)
        return $q.all(_.map(templateIds, DataSetService.getReferentialDataSetById));
			else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
        return $q.all(_.map(templateIds, ProgramService.getProgramById));
		};
		$scope.renderTemplates = function(templates) {
			$scope.pages = [];
			var render = function(){
        $scope.$apply();
        $q.when(templates ? templates : getTemplatesFromDHIS())
					.then(customizeTemplates)
          .then(processTemplates)
          .then(addProcessedPagesToDOM)
          .catch(handleError)
          .then(releaseUI);
      }.bind(this);
      setTimeout(render, 100);//giving the app enough time to load respective css like dataset.css or coversheet etc
		};
		var releaseUI = function(){}; //TODO: define this
	}]);
