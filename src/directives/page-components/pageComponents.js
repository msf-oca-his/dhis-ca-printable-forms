TallySheets.directive('pageComponents', [function() {
	return {
		restrict: 'E',
		template: require('./pageComponentView.html'),
		scope: {
			components:'=', 
			width: '='
		},
		link: function($scope) {
			$scope.getStyles = function() {
				return'width:' + 87 + "mm;"
			};
		}
	};
}]);