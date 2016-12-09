TallySheets.directive('comments', [function(s) {
	return {
		restrict: 'E',
		template: require('./commentsView.html'),
		scope: {
			content: '='
		}
	};
}]);