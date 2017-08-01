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
		$scope.rootNodes = [];
		$scope.inlineAlert = {
			message: '',
			type: '',
			shown: false
		};
		var templatesCustomizations = [];
		var templatesFromDhis = [];
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

		var processDataSets = function(dataSets) {
			$scope.spinnerShown = true;
			$scope.programMode = null;
			return DataSetProcessor.process(dataSets);
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

		var processTemplates = function(templates) {
			if($scope.selectedTemplatesType == PageTypes.DATASET)
				return $q.when(templates).then(processDataSets);
			else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
				return $q.when(templates).then(processPrograms);
			else return $q.when([]);
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
		};

		$scope.closeModalAlert = function(context) {
			window.location = dhisUrl;
		};

		var getTemplateFromDHIS = function(id) {
      if($scope.selectedTemplatesType == 'DATASET')
        return DataSetService.getReferentialDataSetById(id);
      else
        return ProgramService.getProgramById(id);
    };

		$scope.onTemplateSelectionChanged = function(templates, action, position) {
			var removeTreeAndCustomizationsAt = function(position){
        _.pullAt($scope.rootNodes, position);
        _.pullAt(templatesCustomizations, position);
			};
			if(_.isEqual(action, 'remove')){
        removeTreeAndCustomizationsAt(position)
        $scope.$apply();
      }
			else if (_.isEqual(action, 'select'))
				$q.when(templates[position].data.id)
					.then(getTemplateFromDHIS)
					.then(function(template){
						templatesFromDhis[position]= template;
            $scope.rootNodes[position] = TemplatesToJsTreeNodesService.getJsTreeNodes(template, $scope.selectedTemplatesType);
            templatesCustomizations[position] = {completeSectionRemoval: {}, partialSectionRemoval: {}};
					});
    };

		var getCustomizedTemplates = function(){
      var customizedTemplates = _.cloneDeep(templatesFromDhis);

      var customizeTemplate = function(template, index){
        var removeDataElement = function(dataElementIndexesAsObjects, sectionIndex){
            _.pullAt(template.sections[sectionIndex].dataElements, _.keys(dataElementIndexesAsObjects));
        };
        _.map(templatesCustomizations[index].partialSectionRemoval, removeDataElement);
      };
      _.map(customizedTemplates, customizeTemplate);
			return customizedTemplates;
		};

		$scope.renderTemplates = function() {
			$scope.pages = [];
			$q.when()
				.then(getCustomizedTemplates)
				.then(processTemplates)
				.then(addProcessedPagesToDOM)
				.catch(handleError)
				.then(releaseUI);
		};

		var getIndexOfTree = function(treeInstance){
			return treeInstance.attr('index');
		};

		var releaseUI = function(){}; //TODO: define this

		$scope.onTreeSelectionChanged = function(event, data) {
			if(_.isEqual(data.action, 'deselect_node')){
        var node = data.node;
        var tree = data.instance;
        var parentNode = tree.get_node(node.parent);
        var currentTemplateCustomization = templatesCustomizations[getIndexOfTree(data.instance.element)];
        _.merge(currentTemplateCustomization.partialSectionRemoval, {[parentNode.original.index] : {[node.original.index]: {}}});
			}
    }

	}]);
