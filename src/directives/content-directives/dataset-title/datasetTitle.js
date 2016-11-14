TallySheets.directive('datasetTitle', [ function() {
	return {
		restrict: 'E',
		template: require('./datasetTitleView.html'),
		scope: {
			content: '='
		}
	}
}]);