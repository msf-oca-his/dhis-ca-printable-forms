TallySheets.directive('sectionTitle', [function() {
	return {
		restrict: 'E',
		template: require('./sectionTitleView.html'),
		scope: {
			component: '='
		},
		link: function($scope) {
		}
	};
}]);