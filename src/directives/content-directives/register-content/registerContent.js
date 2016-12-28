TallySheets.directive('registerContent', ['Config', 'DhisConstants', function(config, DhisConstants) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			var pageType = 'A4';
			$scope.rowHeight = config.Register.dataEntryRowHeight + config.Metrics.mm;
			$scope.rows = new Array(Math.floor((config.PageTypes[pageType].LandScape.availableHeight - config.Register.pageHeaderHeight - config.Register.tableHeaderHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == DhisConstants.ValueTypes.TEXT) ? 'deField text' : 'deField default'
			};
		}
	};
}]);
