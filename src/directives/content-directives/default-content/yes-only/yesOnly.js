TallySheets.directive('yesOnly', [function() {
	return {
		restrict: 'E',
		template: require('./yesOnlyView.html'),
		scope: {
			element: '='
		},
		link: function($scope) {
		}
	};
}]);