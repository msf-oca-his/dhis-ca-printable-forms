TallySheets.directive('registerTemplate', [ function() {
	return {
		restrict: 'E',
		template: require('./registerTemplateView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		}
	}
}]);
