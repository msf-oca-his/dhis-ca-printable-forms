TallySheets.directive('templateSelector', ['DataSetService', 'ProgramService', 'Config', 'ModalAlert',
	'ModalAlertTypes', 'ModalAlertsService', 'CustomAngularTranslateService', '$q', 'DhisConstants', 'ServiceError',
	function(DataSetService, ProgramService, config, ModalAlert, ModalAlertTypes, ModalAlertsService,
		CustomAngularTranslateService, $q, DhisConstants, ServiceError) {
		return {
			restrict: 'E',
			template: require('./templateSelectorView.html'),
			scope: {
				loadAfter: '=',
				onChange: '&',
				selectedTemplatesType: '='
			},
			link: function($scope) {

				var dataSetPrefixTranslator = function() {
					return CustomAngularTranslateService.getTranslation(config.Prefixes.dataSetPrefix.translationKey).then(function(prefix) {
						$scope.dataSetPrefix = prefix;
					});
				};

				var programPrefixTranslator = function() {
					return CustomAngularTranslateService.getTranslation(config.Prefixes.programPrefix.translationKey).then(function(prefix) {
						$scope.programPrefix = prefix;
					});
				};

				var getTranslatedPrefixes = function() {
					dataSetPrefixTranslator();
					programPrefixTranslator();
				};

				var getPrintableAttribute = function(attributeValues) {
					return _.reduce(_.filter(attributeValues, function(attributeValue) {
						if(attributeValue.attribute.id === config.customAttributes.printFlagUID.id) {
							return attributeValue;
						}
					}));
				};

				var alertForEmptyTemplates = function() {
					if($scope.templates.length == 0) {
						CustomAngularTranslateService.getTranslation('attribute_not_set').then(function(translatedMessage) {
							ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
						});
					}
				};

				var isPrintableTemplate = function(template) {
					var printableAttribute = getPrintableAttribute(template.attributeValues);
					return printableAttribute && printableAttribute.value == DhisConstants.Boolean.true;
				};

				var addDataSetPrefix = function(dataSet) {
					dataSet.displayName = $scope.dataSetPrefix + dataSet.displayName;
					return dataSet;
				};

				var addProgramPrefix = function(program) {
					program.displayName = $scope.programPrefix + program.displayName;
					return program;
				};

				var prepareError = function(message, config) {
					var err = new Error(message);
					err.errorCode = message;
					err.errorType = "error";
					err.errorSrc = config;
					return err
				};

				var getAllTemplates = function() {
					return $q.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
						.then(function(arrayOfTemplates) {
							var printFlagUID = config.customAttributes.printFlagUID;
							var allDataSets = arrayOfTemplates[0];
							var allPrograms = arrayOfTemplates[1];

							if(_.isEmpty(allDataSets) && _.isEmpty(allPrograms))
								return $q.reject(prepareError("no_templates", ""));

							var dataSetTemplates = printFlagUID ? _.filter(allDataSets, isPrintableTemplate) : allDataSets;
							var programTemplates = printFlagUID ? _.filter(allPrograms, isPrintableTemplate) : allPrograms;

							$scope.dataSetTemplates = _.map(dataSetTemplates, addDataSetPrefix);
							$scope.programTemplates = _.map(programTemplates, addProgramPrefix);
							return _.flatten([$scope.dataSetTemplates, $scope.programTemplates]);
						});
				};

				//TODO: UX input: How should alerts be handled ?
				var loadTemplates = function() {
					$scope.templates = [];
					getAllTemplates()
						.then(function(templates) {
							$scope.templates = templates;
							alertForEmptyTemplates();
						})
						.catch(function(err) {
							CustomAngularTranslateService.getTranslation(err.errorCode).then(function(translatedMessage) {
								ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
							});
						})
				};

				var handleUpdate = function() {
					if(!$scope.onChange) return;
					$scope.selectedTemplatesType = getTypeOfTemplate($scope.selectedTemplates[0], $scope.$parent.PageTypes);
					$scope.$apply();
					$scope.onChange({selectedTemplates: $scope.selectedTemplates});
				};

				getTranslatedPrefixes();

				$scope.selectorLoaded = false;
				$scope.removeTemplate = function(index) {
					$scope.selectedTemplates.splice(index, 1);
					if($scope.selectedTemplates.length == 1)
						$scope.showMultipleTemplates = false;
					setTimeout(handleUpdate, 1);
				};

				$scope.addForm = function() {
					$scope.showMultipleTemplates = true;
					$scope.selectedTemplates.push("");
				};

				$scope.select = function() {
					handleUpdate();
				};

				$scope.loadAfter
					.then(loadTemplates)
					.catch(function() {});
				$scope.showMultipleTemplates = false;
				$scope.selectedTemplates = [""];
			}

		};
	}]);

var getTypeOfTemplate = function(template, PageTypes) {
	if(_.isEmpty(template))
		return;
	if(template.constructor.name == "DataSet")
		return PageTypes.DATASET;
	else if(template.constructor.name == "Program")
		return PageTypes.PROGRAM;
};
