TallySheets.directive('registerContent', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			var pageType = 'A4';
			$scope.units = config.Metrics.mm;
			$scope.widthOfSNOColumn = config.Register.widthOfSNOColumn + config.Metrics.mm;
			$scope.tableHeaderHeight = config.Register.tableHeaderHeight + config.Metrics.mm;
			$scope.rowHeight = config.Register.dataEntryRowHeight + config.Metrics.mm;
			$scope.rows = new Array(Math.floor((config.PageTypes[pageType].LandScape.availableHeight - config.Register.pageHeaderHeight - config.Register.tableHeaderHeight) / config.Register.dataEntryRowHeight));
		}
	};
}]);
