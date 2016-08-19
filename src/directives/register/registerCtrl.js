TallySheets.directive('register', function() {
	return {
		restrict: 'E',
		template: require('./registerView.html'),
		scope: {
			contents: '=',
			rows: '='
		}
	}
});