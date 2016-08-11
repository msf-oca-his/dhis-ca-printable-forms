TallySheets.directive('list', function() {
	return {
		restrict: 'E',
		template: require('./listView.html'),
		scope: {
			dataelement: '='
		}
	};
});