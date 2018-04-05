window.TallySheets = angular.module('TallySheets', ['pascalprecht.translate', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ['$scope','$rootScope','DataSetService', 'ProgramService', 'CoversheetProcessor',
	'RegisterProcessor', 'CustomAttributeValidationService', 'ExportToExcel', 'appLoadingFailed', 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes',
	'AlertTypesContract', 'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', '$q', 'CodeSheetProcessor', 'PageTypes', 'TemplateCustomizationService','ComponentProcessor',
	function($scope, $rootScope, DataSetService, ProgramService, CoversheetProcessor, RegisterProcessor,
		CustomAttributeValidationService, ExportToExcel, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes,
		AlertTypesContract, InlineAlert, InlineAlertTypes, CustomAngularTranslateService, $q, CodeSheetProcessor, PageTypes, TemplateCustomizationService,ComponentProcessor) {

		$scope.appLoadingFailed = appLoadingFailed;
		$scope.spinnerShown = false;
		$scope.PageTypes = PageTypes;
		$rootScope.cachedTemplates = [];
		$rootScope.cachedProgramNames = [];
		$scope.templatesCustomizations = [];
		var portraitConfig;
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

		var addTemplatesDisplayNameFromCache = function(templates) {

			var addTemplateDisplayNameFromCache = function(template) {

				var cachedTemplate = _($rootScope.cachedTemplates).find({'id': template.id});

				if(_.isEmpty(cachedTemplate)) $rootScope.cachedTemplates.push(template);

				else template.displayName = cachedTemplate.displayName;
			};

			_.map(templates, addTemplateDisplayNameFromCache);
		};

		var processDataSets = function(dataSets,config) {
			$scope.spinnerShown = true;
			$scope.programMode = null;

			addTemplatesDisplayNameFromCache(dataSets);
			
			console.log(dataSets)
			
			return ComponentProcessor.processComponents(dataSets, config);
		};
		var prepareComponent = function(program) {
			_.map(program.programStages[0].programStageSections,function(section) {
				section.dataElements = _.cloneDeep(section.programStageDataElements);
			});
			
			_.map(program.programStages[0],function(sections) {
				program.sections = sections;
			});

			return program
		};
		
		var addCommentsSectionTo = function(program) {
			var comments = {
				displayName: 'Comments',
				name: 'Comments',
				dataElements: [{
					displayFormName: 'Comments',
					name: 'Comments',
					valueType: 'COMMENT'
				}]
 			};
			program.sections.push(comments);
		};

		var getPages = function(program, programMode) {

			var cachedTemplates = _($scope.cachedTemplates).find({'id': program.id});

			if(_.isEmpty(cachedTemplates)) $scope.cachedTemplates.push(program);
			else program.displayName = cachedTemplates.displayName;

			//TODO: get rid of switch statements
			switch(programMode) {
				case PageTypes.COVERSHEET :
					program = prepareComponent(program);
					return $q.when({})
						.then(getConfig)
						.then(function(config) {
							addCommentsSectionTo(program);
							return ComponentProcessor.processComponents([program],config);
						});
				case PageTypes.REGISTER:
					return RegisterProcessor.process(program);
				case PageTypes.CODESHEET:
					return CodeSheetProcessor.process(program);
			}
		};

		var processPrograms = function(programs) {
			if($scope.programMode == null)
				return;
			$scope.spinnerShown = true;
			return getPages(_.cloneDeep(programs[0]),$scope.programMode);
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
				return $q.when({})
					.then(getConfig)
					.then(function(config) {
						return processDataSets(templates,config);
					});
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
			$rootScope.renderTemplates();
			$scope.$broadcast('templatesSelectionChanged', templates, action, position);
    };
		var customizeTemplates = function(templates){
			if(_.isEmpty($scope.templatesCustomizations))
				return templates;
      return TemplateCustomizationService.customizeTemplates(templates, $scope.templatesCustomizations, $scope.selectedTemplatesType);
		};

		var getConfig = function() {
			var defer = $q.defer();
			var xobj = new XMLHttpRequest();
			xobj.overrideMimeType("application/json");
			xobj.open('GET', 'A4.potrait.json', true);
			xobj.onreadystatechange = function() {
				if(xobj.readyState == 4 && xobj.status == "200") {
					// .open will NOT return a value but simply returns undefined in async mode so use a callback
					return defer.resolve(JSON.parse(xobj.responseText));

				}
			};
			xobj.send(null);
			return defer.promise;
		};
		
		var getTemplatesFromDHIS = function() {
			var templateIds = _($scope.templates)
													.map('data.id')
													.map(_.cloneDeep)
													.value();
			if($scope.selectedTemplatesType == PageTypes.DATASET)
        return $q.all(_.map(templateIds, DataSetService.getReferentialDataSetById));
			else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
        return $q.all(_.map(templateIds, ProgramService.getProgramById));
		};
		$rootScope.renderTemplates = function(templates) {
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
