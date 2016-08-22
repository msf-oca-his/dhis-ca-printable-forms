TallySheets.directive('page', function() {
	return {
		restrict: 'E',
		template: require('./pageView.html'),
		scope: {
			page: '=',
			pageNumber: '=',
			totalPages: '=',
			type: '=',
			programMode: '='
		}
	};
});