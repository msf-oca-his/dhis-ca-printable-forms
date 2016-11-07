TallySheets.directive('templateRegister', [ function() {
	return {
		restrict: 'E',
		template: require('./templateRegisterView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		}
	}
}]);
