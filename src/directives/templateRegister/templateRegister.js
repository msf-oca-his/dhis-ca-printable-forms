TallySheets.directive('templateRegister', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateRegisterView.html'),
		scope: {
			contents: '=',
			rows: '=',
			programName: '=',
			isLastPage: '='
		},
		link: function($scope) {
			$scope.displayOptions = config.DisplayOptions;
			$scope.rows = Array(Math.floor((config.Register.availableHeight - config.Register.headerHeight - config.Register.labelHeight) / config.Register.dataEntryRowHeight));
			$scope.getClass = function(dataElement) {
				return (dataElement.valueType == 'TEXT') ? 'deField text' : 'deField general'
			};
		}
	}
}]);
