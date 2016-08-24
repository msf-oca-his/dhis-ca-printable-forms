TallySheets.directive('registerContent', [ 'Config', function(config) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.rowHeight = config.Register.dataEntryRowHeight;
			$scope.rows = new Array(Math.floor((config.Register.availableHeight - config.Register.headerHeight - config.Register.labelHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == 'TEXT') ? 'deField text' : 'deField general'
			};
		}
	};
}]);