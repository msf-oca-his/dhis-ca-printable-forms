TallySheets.directive('defaultContent', [ function() {
	return {
		restrict: 'E',
		template: require('./defaultContentView.html'),
		scope: {
			content: '='
		}
	}
}]);