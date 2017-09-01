TallySheets.directive('defaultContent', ['DhisConstants', 'Config', function(DhisConstants, config) {
	return {
		restrict: 'E',
		template: require('./defaultContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.widthOfDataElementLabel = config.DataSet.widthOfDataElement + config.Metrics.mm;
			$scope.widthOfDataElementField = (((config.PageTypes.A4.Portrait.availableWidth - config.DataSet.gapBetweenColumnsInDefaultRendering) / config.DataSet.numberOfColumnsInDefaultRendering) - config.DataSet.widthOfDataElement) + config.Metrics.mm;
			$scope.heightOfDataElement = config.DataSet.defaultHeightOfDataElementLabel + config.Metrics.mm;
			$scope.gapBetweenColumns = config.DataSet.gapBetweenColumnsInDefaultRendering + config.Metrics.mm;
		}
	}
}]);