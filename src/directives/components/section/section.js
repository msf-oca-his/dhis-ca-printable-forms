TallySheets.directive('section', [function() {
	return {
		restrict: 'E',
		template: require('./sectionView.html'),
		scope: {
			component: '='
		},
		link: function($scope) {
		}
	};
}]);