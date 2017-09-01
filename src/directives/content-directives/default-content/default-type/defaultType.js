TallySheets.directive('defaultType', [function() {
	return {
		restrict: 'E',
		template: require('./defaultView.html'),
		scope: {
			element: '='
		},
		link: function($scope) {
		}
	};
}]);