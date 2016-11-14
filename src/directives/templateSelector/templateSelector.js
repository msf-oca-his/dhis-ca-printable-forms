TallySheets.directive('templateSelector', ['$rootScope', '$window', '$timeout', '$translate',
	'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', 'ModalAlert',
	'ModalAlertTypes', 'ModalAlertsService', 'CustomAngularTranslateService', '$q',
	function($rootScope, $window, $timeout, $translate, DataSetService, ProgramService,
	         CustomAttributeService, config, ModalAlert, ModalAlertTypes, ModalAlertsService,
	         CustomAngularTranslateService, $q) {
	return {
		restrict: 'E',
		template: require('./templateSelectorView.html'),
		scope: {
			loadAfter: '=',
			onChange: '&',
			selectedTemplatesType: '='
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
			$scope.removeTemplate = function(index){
				$scope.selectedTemplates.splice(index, 1);
				if($scope.selectedTemplates.length == 1)
					$scope.showMultipleTemplates = false;
				setTimeout(handleUpdate, 1);
			};

			$scope.addForm = function() {
				$scope.showMultipleTemplates = true;
				$scope.selectedTemplates.push("");
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
					CustomAngularTranslateService.getTranslation('attribute_not_set').then(function(translatedMessage){
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

			var addDataSetPrefix = function(dataSet){
				dataSet.displayName = $scope.dataSetPrefix + dataSet.displayName;
				return dataSet;
			};

			var addProgramPrefix = function(program){
				program.displayName = $scope.programPrefix + program.displayName;
				return program;
			};
			var getAllTemplates = function() {
				return $q.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()])
					.then(function(arrayOfTemplates) {
						var dataSetTemplates = config.CustomAttributes.printFlagUID ? _.filter(arrayOfTemplates[0], isPrintableTemplate) : arrayOfTemplates[0];
						var programTemplates = config.CustomAttributes.printFlagUID ? _.filter(arrayOfTemplates[1], isPrintableTemplate) : arrayOfTemplates[1];
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
			};

			var handleUpdate = function(){
				if(!$scope.onChange) return;
				$scope.selectedTemplatesType = getTypeOfTemplate($scope.selectedTemplates[0]);
				$scope.$apply();
				$scope.onChange({selectedTemplates: $scope.selectedTemplates});
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


var getTypeOfTemplate = function(template) {
	if(_.isEmpty(template))
		return;
	if(template.constructor.name == "DataSet")
		return "DATASET";
	else if(template.constructor.name == "Program")
		return "PROGRAM";
};