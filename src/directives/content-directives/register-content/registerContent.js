TallySheets.directive('registerContent', [ 'Config', function(config) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.rowHeight = config.Register.dataEntryRowHeight;
			$scope.rows = new Array(Math.floor((config.PageTypes.A4.LandScape.availableHeight - config.Register.pageHeaderHeight - config.Register.tableHeaderHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == 'TEXT') ? 'deField text' : 'deField general'
			};
		}
	};
}]);
