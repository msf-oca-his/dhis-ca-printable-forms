TallySheets.directive('templateRegister', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateRegisterView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		},
		link: function($scope) {
			$scope.rowHeight = config.Register.dataEntryRowHeight;
			$scope.rows = new Array(Math.floor((config.Register.availableHeight - config.Register.headerHeight - config.Register.labelHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == 'TEXT') ? 'deField text' : 'deField general'
			};
		}
	}
}]);
