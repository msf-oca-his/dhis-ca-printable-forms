TallySheets.directive('categoryCombo', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./categoryComboView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.widthOfDataElementLabel = config.DataSet.widthOfDataElement + config.Metrics.mm;
			$scope.heightOfTableHeader = config.DataSet.heightOfCatCombTableHeader + config.Metrics.mm;
			$scope.heightOfDataElement = config.DataSet.heightOfDataElementInCatCombTable + config.Metrics.mm;
			$scope.widthOfDataElementField = config.DataSet.widthOfCategoryOptionCombo + config.Metrics.mm;
			$scope.getTableWidth = function(categoryOptionCombos) {
				return (categoryOptionCombos.length * config.DataSet.widthOfCategoryOptionCombo + config.DataSet.widthOfDataElement + 1) + config.Metrics.mm;
			}
		}
	};
}]);