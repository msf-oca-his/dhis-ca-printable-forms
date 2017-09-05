TallySheets.directive('defaultDataElementType', [function() {
	return {
		restrict: 'E',
		template: require('./defaultDataElementTypeView.html'),
		scope: {
			element: '='
		},
		link: function($scope) {
		}
	};
}]);