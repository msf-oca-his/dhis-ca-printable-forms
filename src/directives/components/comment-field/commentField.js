TallySheets.directive('commentField', [function() {
	return {
		restrict: 'E',
		template: require('./commentFieldView.html'),
		scope: {
			component: '='
		}
	};
}]);