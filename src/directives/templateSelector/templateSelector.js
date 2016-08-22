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

			var isAttributePresentInConfig = function(printableUID) {
				return _.isEmpty(printableUID);
			};

			var isAttributeAssignedToTemplate = function(attribute) {
				return attribute != undefined && (attribute.dataSetAttribute && attribute.programAttribute)
			};

			var alertForEmptyTemplates = function() {
				if($scope.templates.length == 0 && !$scope.alertShown) {
					$translate('ATTRIBUTE_NOT_SET').then(function(translatedValue) {
						alert(translatedValue);
					});
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

			//TODO: UX input: How should alerts be handled ?
			var loadTemplates = function() {
				$scope.alertShown = false;
				$scope.templates = [];

				if(isAttributePresentInConfig(config.CustomAttributes.printFlagUID)) {
					showAllTemplates();
				}
				else {
					showValidReportingTemplates();
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
