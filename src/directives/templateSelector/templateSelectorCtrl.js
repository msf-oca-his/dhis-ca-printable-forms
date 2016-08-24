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
			var showValidPrintableTemplates = function() {
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

			var areConfigOptionsNotEqualTo = function(systemOptions) {
				var systemOptions = _.map(systemOptions, function(option) {
					return option.code
				});

				var configOptions = _.map(config.DisplayOptions, function(option) {
					return option
				});
				return !_.isEqual(configOptions.sort(), systemOptions.sort())
			};

			var isAttributeAssignedToDataElement = function(attribute) {
				if(attribute.dataElementAttribute == false) {
					$translate('NO_ASSOCIATION_WITH_DATAELEMENT').then(function(translatedValue) {
						alert(translatedValue)
					});
				} else {
					return true;
				}
			};

			var isAttributeValid = function(attribute) {
				if(_.isEmpty(attribute.optionSet)) {
					$translate('NO_ASSOCIATION_WITH_OPTIONSET').then(function(translatedValue) {
						alert(translatedValue);
					});
				}

				else if(_.isEmpty(attribute.optionSet.options)) {
					$translate('OPTIONSET_WITHOUT_OPTIONS').then(function(translatedValue) {
						alert(translatedValue);
					});
				}
				else {
					var yes = areConfigOptionsNotEqualTo(attribute.optionSet.options);
					if(yes) {
						$translate('OPTIONSET_WITH_INCORRECT_OPTIONS').then(function(translatedValue) {
							alert(translatedValue);
						});
					}
					else {
						return isAttributeAssignedToDataElement(attribute);
					}
				}
			};

			var isDisplayOptionsAttributeValid = function() {
				return Promise.all([CustomAttributeService.getCustomAttribute(config.CustomAttributes.displayOptionUID)]).then(function(customAttribute) {
					var attribute = _.flatten(customAttribute);
					attribute = attribute[0];

					if(_.isEmpty(attribute)) {
						$translate('NO_ATTRIBUTE_EXISTS').then(function(translatedValue) {
							alert(translatedValue);
						});
					}
					else {
						return isAttributeValid(attribute);
					}
				})
			};
			//TODO: UX input: How should alerts be handled ?
			var loadTemplates = function() {
				$scope.alertShown = false;
				$scope.templates = [];

				var noDisplayOptionUID = isAttributeNotPresentInConfig(config.CustomAttributes.displayOptionUID);
				var noPrintFlagUID = isAttributeNotPresentInConfig(config.CustomAttributes.printFlagUID);

				if(noPrintFlagUID && noDisplayOptionUID) {
					showAllTemplates();
				}

				else if(!noPrintFlagUID && noDisplayOptionUID) {
					showValidPrintableTemplates();
				}

				else if(noPrintFlagUID && !noDisplayOptionUID) {
					isDisplayOptionsAttributeValid().then(function(isValid) {
						if(isValid) {
							showAllTemplates();
						}
					})
				}
				else {
					isDisplayOptionsAttributeValid().then(function(isValid) {
						if(isValid) {
							showValidPrintableTemplates();
						}
					})
				}
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
