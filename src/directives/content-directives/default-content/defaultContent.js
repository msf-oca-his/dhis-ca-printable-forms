TallySheets.directive('defaultContent', ['DhisConstants', function(DhisConstants) {
	return {
		restrict: 'E',
		template: require('./defaultContentView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.booleanType = DhisConstants.ValueTypes.BOOLEAN;
		}
	}
}]);