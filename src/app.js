window.TallySheets = angular.module('TallySheets', ['pascalprecht.translate', 'DhisModel', 'DhisServices', 'D2']);

TallySheets.filter('to_trusted_html', ['$sce', function($sce) {
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);

TallySheets.controller('TallySheetsController', ['$scope','$rootScope','DataSetService', 'ProgramService', 'CoversheetProcessor',
	'RegisterProcessor', 'CustomAttributeValidationService', 'ExportToExcel', 'appLoadingFailed', 'ModalAlertsService', 'ModalAlert', 'ModalAlertTypes',
	'AlertTypesContract', 'InlineAlert', 'InlineAlertTypes', 'CustomAngularTranslateService', '$q', 'CodeSheetProcessor', 'PageTypes', 'TemplateCustomizationService','ComponentProcessor', 'PageConfigReader',
	function($scope, $rootScope, DataSetService, ProgramService, CoversheetProcessor, RegisterProcessor,
		CustomAttributeValidationService, ExportToExcel, appLoadingFailed, ModalAlertsService, ModalAlert, ModalAlertTypes,
		AlertTypesContract, InlineAlert, InlineAlertTypes, CustomAngularTranslateService, $q, CodeSheetProcessor, PageTypes, TemplateCustomizationService, ComponentProcessor, PageConfigReader) {

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
			
			return $q.when({})
				.then(PageConfigReader.getPageConfig)
				.then(_.curry(ComponentProcessor.processComponents)(dataSets))
		};
		var prepareComponent = function(program) {
			_.map(program.programStages[0].programStageSections,function(section) {
				section.dataElements = _.cloneDeep(section.programStageDataElements);
			});
			
			_.map(program.programStages[0],function(sections) {
				program.sections = _.cloneDeep(sections);
			});

			return program
		};
		
		var addCommentsSectionTo = function(program, translatedCodes) {
			var comments = {
				displayName: translatedCodes,
				name: translatedCodes,
				dataElements: [{
					displayFormName: translatedCodes,
					name: translatedCodes,
					valueType: 'COMMENT'
				}]
 			};
			program.sections.push(comments);
		};

		var getTranslatedCodes = function () {
			return CustomAngularTranslateService.getTranslation("Comments");
        };

		var getPageConfig = function (translatedCode) {
			return PageConfigReader.getPageConfig().then(function (pageConfig) {
				return $q.when({
					translatedCodes: translatedCode,
					pageConfig: pageConfig
				});
            })
        }

		var getPages = function(program, programMode) {

			var cachedTemplates = _($scope.cachedTemplates).find({'id': program.id});

			if(_.isEmpty(cachedTemplates)) $scope.cachedTemplates.push(program);
			else program.displayName = cachedTemplates.displayName;

			//TODO: get rid of switch statements
			switch(programMode) {
				case PageTypes.COVERSHEET :
					program = prepareComponent(program);
					return $q.when({})
                        .then(getTranslatedCodes)
						.then(getPageConfig)
						.then(function(data) {
							addCommentsSectionTo(program, data.translatedCodes);
							return ComponentProcessor.processComponents([program],data.pageConfig);
						});
				case PageTypes.REGISTER:
                    return $q.when({})
                        .then(PageConfigReader.getPageConfig)
                        .then(getLandScapeConfig)
                        .then(function(pageConfig) {
                        	return RegisterProcessor.process(program,pageConfig);
                        });
				case PageTypes.CODESHEET:
                    return $q.when({})
                        .then(PageConfigReader.getPageConfig)
                        .then(function(pageConfig) {
                            return CodeSheetProcessor.process(program,pageConfig);
                        });
			}
		};

		var getLandScapeConfig = function(pageConfig){
			var height = pageConfig.height;
            pageConfig.height = pageConfig.width;
            pageConfig.width = height;
            return pageConfig;
        }

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
					.then(PageConfigReader.getPageConfig())
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
