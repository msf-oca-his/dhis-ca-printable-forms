TallySheets.directive('categoryCombo', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./categoryComboView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.getTableWidth = function(categoryOptionCombos) {
				return (categoryOptionCombos.length * config.DataSet.widthOfCategoryOptionCombo + config.DataSet.widthOfDataElement) + config.Metrics.mm;
			}
		}
	};
}]);