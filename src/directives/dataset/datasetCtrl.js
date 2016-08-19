TallySheets.directive('templateDataset', function() {
	return {
		restrict: 'E',
		template: require('./datasetView.html'),
		scope: {
			contents: '=',
			datasetName: '='
		}
	};
});
//TODO: no need of extra controller.. add this code to link.
TallySheets.controller('datasetCtrl', ['$scope', 'Config', function($scope, config) {
	$scope.displayOptions = config.DisplayOptions;
	$scope.getTableWidth = function(section) {
		if(section.isCatComb) {
			return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";  //TODO: magic numbers...
		}
		else return "9.5cm";
	}
}]);