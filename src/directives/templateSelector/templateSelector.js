TallySheets.directive('templateSelector', ['$rootScope', '$window', '$timeout', '$translate', 'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', 'ModalAlert', 'ModalAlertTypes', 'ModalAlertsService', 'CustomAngularTranslateService', '$q', function($rootScope, $window, $timeout, $translate, DataSetService, ProgramService, CustomAttributeService, config, ModalAlert, ModalAlertTypes, ModalAlertsService, CustomAngularTranslateService, $q) {
	return {
		restrict: 'E',
		template: require('./templateSelectorView.html'),
		scope: {
			loadAfter: '=',
			onSelectTemplate: '&'
		},
		link: function($scope, element) {
		
			var dataSetPrefixTranslater = function() {
				return CustomAngularTranslateService.getTranslation(config.Prefixes.dataSetPrefix.translationKey).then(function(prefix) {
					$scope.dataSetPrefix = prefix;
				});
			};

			var programPrefixTranslater = function() {
				return CustomAngularTranslateService.getTranslation(config.Prefixes.programPrefix.translationKey).then(function(prefix) {
					$scope.programPrefix = prefix;
				});
			};

			var getTranslatedPrefixes = function() {
				dataSetPrefixTranslater();
				programPrefixTranslater();
			};

			getTranslatedPrefixes();

			$scope.selectorLoaded = false;

			var refreshBootstrapSelect = function() {
				$(element).find('.selectpicker').selectpicker('refresh');
				$(element).find('.selectpicker').selectpicker('render');
			};

			var getPrintableAttribute = function(attributeValues) {
				return _.reduce(_.filter(attributeValues, function(attributeValue) {
					if(attributeValue.attribute.id === config.CustomAttributes.printFlagUID.id) {
						return attributeValue;
					}
				}));
			};

			var alertForEmptyTemplates = function() {
				if($scope.templates.length == 0) {
					CustomAngularTranslateService.getTranslation('ATTRIBUTE_NOT_SET').then(function(translatedMessage){
						ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
					});
				}
			};

			var isPrintableTemplate = function(template) {
				var isValid = "true";
				var printableAttribute = getPrintableAttribute(template.attributeValues);
				if(printableAttribute && printableAttribute.value == isValid)
					return true;
				return false;
			};

			var getAllTemplates = function() {
				return Promise.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
					.then(function(arrayOfTemplates) {
						return _.flatten(arrayOfTemplates);
					});
			};

			var refreshElement = function() {
				$scope.selectorLoaded = true;
				$scope.$apply();
				refreshBootstrapSelect();
			};

			//TODO: UX input: How should alerts be handled ?
			var loadTemplates = function() {
				$scope.templates = [];
				getAllTemplates()
					.then(function(templates) {
						$scope.templates = config.CustomAttributes.printFlagUID ? _.filter(templates, isPrintableTemplate) : templates;
						alertForEmptyTemplates();
						refreshElement();
					})

			};

			$scope.changeHandler = function() {
				if($scope.selectedTemplate == null) return;
				$scope.selectedTemplate.type = getTypeOfTemplate($scope.selectedTemplate);
				$scope.onSelectTemplate({selectedTemplate: $scope.selectedTemplate});
			};
			$scope.loadAfter
				.then(loadTemplates)
				.catch(function() {});
		}
	};
}]);

var getTypeOfTemplate = function(template) {
	if(template.constructor.name == "DataSet")
		return "DATASET";
	else if(template.constructor.name == "Program")
		return "PROGRAM";
};

TallySheets.filter('addPrefix', [function() {  //TODO: find a good name fo this filter...
	return function(template, $scope) {
		var typeOfTemplate = getTypeOfTemplate(template);
		if(typeOfTemplate == "DATASET")
			return $scope.dataSetPrefix + template.displayName;
		if(typeOfTemplate == "PROGRAM")
			return $scope.programPrefix + template.displayName;
		else
			return template;
	}
}]);
