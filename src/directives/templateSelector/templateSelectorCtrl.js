TallySheets.directive('templateSelector', ['$rootScope', '$window', '$timeout', '$translate', 'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', function($rootScope, $window, $timeout, $translate, DataSetService, ProgramService, CustomAttributeService, config) {
	return {
		restrict: 'E',
		template: require('./templateSelectorView.html'),
		scope: {
			onSelectDataset: '&',
			selectedTemplate: '=',
			validationResult: '='
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

			var alertForEmptyTemplates = function(result) {
				if($scope.templates.length == 0 && !result.alertShown) {
					$translate('ATTRIBUTE_NOT_SET').then(function(translatedValue) {
						alert(translatedValue);
					});
				}
			};

			var addTemplateToDisplay = function(templates) {
				var isValid = "true";
				_.map(_.flatten(templates), function(template) {
					var printableAttribute = getPrintableAttribute(template.attributeValues);
					if(printableAttribute && printableAttribute.value == isValid) {
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

			var showValidPrintableTemplates = function(result) {
				Promise.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
					.then(function(templates) {
						addTemplateToDisplay(templates);
						alertForEmptyTemplates(result);
						$rootScope.$apply();
						refreshBootstrapSelect();
					});
			};

			//TODO: UX input: How should alerts be handled ?
			var loadTemplates = function(result) {
				$scope.templates = [];

				if(result.showAllTemplates) {
					showAllTemplates();
				}
				else {
					showValidPrintableTemplates(result);
				}
			};

			$scope.changeHandler = function() {
				if($scope.selectedDataSet == null) return;
				$scope.selectedTemplate.id = $scope.selectedDataSet.id;
				$scope.selectedTemplate.type = getTypeOfTemplate($scope.selectedDataSet);
				$scope.onSelectDataset();
			};
			$scope.validationResult.then(function(result) {
				if(!result.alertShown) {
					loadTemplates(result);
				}

			})
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
