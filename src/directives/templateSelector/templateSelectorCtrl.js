TallySheets.directive('templateSelector', ['$rootScope', '$window', '$timeout', '$translate', 'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', function($rootScope, $window, $timeout, $translate, DataSetService, ProgramService, CustomAttributeService, config) {
	return {
		restrict: 'E',
		template: require('./templateSelectorView.html'),
		scope: {
			onSelectDataset: '&',
			selectedTemplate: '='
		},
		link: function($scope, element) {
			$scope.selectedDataSet = {};
			$scope.selectorLoaded = false;

			var refreshBootstrapSelect = function() {
				$(element).find('.selectpicker').selectpicker('refresh');
				$(element).find('.selectpicker').selectpicker('render');
				$scope.selectorLoaded = true;
				$rootScope.$apply();
			};

			var getPrintableAttribute = function(attributeValues) {
				return _.reduce(_.filter(attributeValues, function(attributeValue) {
					if(attributeValue.attribute.id === config.CustomAttributes.printFlagUID) {
						return attributeValue;
					}
				}));
			};

			var isAttributeNotPresentInConfig = function(attributeUID) {
				return _.isEmpty(attributeUID);
			};

			var isAttributeAssignedToTemplate = function(attribute) {
				return attribute != undefined && (attribute.dataSetAttribute && attribute.programAttribute)
			};

			var alertForEmptyTemplates = function() {
				if($scope.templates.length == 0 && !$scope.alertShown) {
					// $translate('ATTRIBUTE_NOT_SET').then(function(translatedValue) {
					alert("The specified UID doesn't exist in the system. Please contact your system administrator.");
					// });
				}
			};

			var addTemplateToDisplay = function(templates) {
				var yes = "true";
				_.map(_.flatten(templates), function(template) {
					var printableAttribute = getPrintableAttribute(template.attributeValues);
					if(printableAttribute && printableAttribute.value == yes) {
						$scope.templates.push(template)
					}
				});
			};

			var showAllTemplates = function() {
				Promise.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
					.then(function(templates) {
						$scope.templates = _.flatten(templates);
						$rootScope.$apply();
						refreshBootstrapSelect();
					});
			};

			//TODO:change the method name and also refactor the code
			var showValidReportingTemplates = function() {
				Promise.all([CustomAttributeService.getCustomAttribute(config.CustomAttributes.printFlagUID)])
					.then(function(customAttribute) {
						var attribute = _.flatten(customAttribute);
						if(_.isEmpty(attribute[0])) {
							$translate('NO_ATTRIBUTE_EXISTS').then(function(translatedValue) {
								$scope.alertShown = true;
								alert(translatedValue);
							});
						}
						else {
							if(!(isAttributeAssignedToTemplate(attribute[0]))) {
								$translate('NO_ASSOCIATION_WITH_ATTRIBUTE').then(function(translatedValue) {
									$scope.alertShown = true;
									alert(translatedValue);
								});
							}
							else
								Promise.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
									.then(function(templates) {
										addTemplateToDisplay(templates);
										alertForEmptyTemplates();

										$rootScope.$apply();
										refreshBootstrapSelect();
									})
						}
					})
			};

			var validateDisplayOptionsUID = function() {
				Promise.all([CustomAttributeService.getCustomAttribute(config.CustomAttributes.displayOptionUID)]).then(function(customAttribute) {
					var attribute = _.flatten(customAttribute);
					if(_.isEmpty(attribute[0])) {
						alert("The specified UID doesn't exist in the system. Please contact your system administrator.");
					}
					else {
						if(_.isEmpty(attribute[0].optionSet)) {
							alert("The specified attribute is not associated with any optionSet. Please contact your system administrator.");
						}
						else if(_.isEmpty(attribute[0].optionSet.options)) {
							alert("The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.")
						}
						else {
							var systemOptions = _.map(attribute[0].optionSet.options, function(option) {
								return option.code
							});

							var configOptions = _.map(config.DisplayOptions, function(option) {
								return option
							});
							if(!_.isEqual(configOptions.sort(), systemOptions.sort())) {
								alert("The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.")
							}
							else {
								if(attribute[0].dataElementAttribute == false) {
									alert("The specified attribute of type optionSet is not assigned to any dataElement. Please contact your system administrator");
								} else {
									showAllTemplates();
								}
							}

						}

					}
				})
			}
			//TODO: UX input: How should alerts be handled ?
			var loadTemplates = function() {
				$scope.alertShown = false;
				$scope.templates = [];
				//TODO:Move this to check config mehtod

				if(isAttributeNotPresentInConfig(config.CustomAttributes.printFlagUID) && isAttributeNotPresentInConfig(config.CustomAttributes.displayOptionUID)) {
					showAllTemplates();
				}

				else if(!isAttributeNotPresentInConfig(config.CustomAttributes.printFlagUID) && isAttributeNotPresentInConfig(config.CustomAttributes.displayOptionUID)) {
					showValidReportingTemplates();
				}

				else if(isAttributeNotPresentInConfig(config.CustomAttributes.printFlagUID) && !isAttributeNotPresentInConfig(config.CustomAttributes.displayOptionUID)) {
					validateDisplayOptionsUID()
				}
				else {
				}
				// else if(isAttributeNotPresentInConfig(config.))
			};

			$scope.changeHandler = function() {
				if($scope.selectedDataSet == null) return;
				$scope.selectedTemplate.id = $scope.selectedDataSet.id;
				$scope.selectedTemplate.type = getTypeOfTemplate($scope.selectedDataSet);
				$scope.onSelectDataset();
			};
			loadTemplates();
		}
	};
}]);

var getTypeOfTemplate = function(template) {
	if(template.constructor.name == "DataSet")
		return "DATASET";
	else if(template.constructor.name == "Program")
		return "PROGRAM";
};

TallySheets.filter('addPrefix', ['Config', function(config) {  //TODO: find a good name fo this filter...
	return function(template) {
		var typeOfTemplate = getTypeOfTemplate(template)
		if(typeOfTemplate == "DATASET")
			return config.Prefixes.dataSetPrefix + template.displayName;
		if(typeOfTemplate == "PROGRAM")
			return config.Prefixes.programPrefix + template.displayName;
		else
			return template;
	}
}]);
