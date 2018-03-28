TallySheets.directive('header', [function() {
	return {
		restrict: 'E',
		template: require('./headerView.html'),
		scope: {
			component: '='
		},
		link: function($scope) {
		}
	};
}]);