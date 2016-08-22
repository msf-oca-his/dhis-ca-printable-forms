TallySheets.directive('templateDataset', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateDatasetView.html'),
		scope: {
			contents: '=',
			datasetName: '='
		},
		link: function($scope) {
			$scope.displayOptions = config.DisplayOptions;
			$scope.getTableWidth = function(section) {
				if(section.isCatComb) {
					return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";  //TODO: magic numbers...
				}
				else return "9.5cm";
			}
		}
	};
}]);
