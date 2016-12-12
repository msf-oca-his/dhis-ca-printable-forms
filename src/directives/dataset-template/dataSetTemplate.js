TallySheets.directive('datasetTemplate', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./datasetTemplateView.html'),
		scope: {
			contents: '=',
			datasetName: '='
		},
		link: function($scope) {
			if(config.customAttributes.displayOptionUID)
				$scope.displayOptions = config.customAttributes.displayOptionUID.options;
		}
	};
}]);
