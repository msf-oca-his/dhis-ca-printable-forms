TallySheets.directive('coversheet', function() {
	return {
		restrict: 'E',
		template: require('./coversheetView.html'),
		scope: {
			contents: '='
		}
	}
});