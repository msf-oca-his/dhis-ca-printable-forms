TallySheets.directive('templateDataset', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateDatasetView.html'),
		scope: {
			contents: '=',
			datasetName: '='
		},
		link: function($scope) {
			if(config.CustomAttributes.displayOptionUID)
				$scope.displayOptions = config.CustomAttributes.displayOptionUID.options;
		}
	};
}]);
