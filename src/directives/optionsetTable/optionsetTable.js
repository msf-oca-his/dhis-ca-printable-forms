TallySheets.directive('optionsetTable', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./optionsetTableView.html'),
		scope: {
			dataelement: '='
		}
	}
}]);