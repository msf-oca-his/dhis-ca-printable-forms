TallySheets.directive('boolean', [function() {
	return {
		restrict: 'E',
		template: require('./booleanView.html'),
		scope: {
			element: '='
		},
		link: function($scope) {
		}
	};
}]);