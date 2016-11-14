TallySheets.directive('categoryCombo', [ function() {
	return {
		restrict: 'E',
		template: require('./categoryComboView.html'),
		scope: {
			content: '='
		}
	};
}]);