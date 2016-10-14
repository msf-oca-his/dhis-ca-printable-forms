TallySheets.directive('codeSheet', [ function() {
	return {
		restrict: 'E',
		template: require('./codeSheetView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		}
	}
}]);