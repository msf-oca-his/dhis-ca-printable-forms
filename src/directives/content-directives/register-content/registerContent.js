TallySheets.directive('registerContent', ['Config', 'ValueTypes', function(config, ValueTypes) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			var pageType='A4';
			$scope.rowHeight = config.Register.dataEntryRowHeight;
			$scope.rows = new Array(Math.floor((config.PageTypes[pageType].LandScape.availableHeight - config.Register.pageHeaderHeight - config.Register.tableHeaderHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == ValueTypes.TEXT) ? 'deField text' : 'deField default'
			};
		}
	};
}]);
