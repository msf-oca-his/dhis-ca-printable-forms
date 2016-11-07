TallySheets.directive('categoryCombo', function() {
	return {
		restrict: 'E',
		template: require('./categoryComboView.html'),
		scope: {
			content: '='
		},
		link: function($scope) {
			$scope.getTableWidth = function(categoryOptionCombos) {
				return (categoryOptionCombos.length * 3 + 4) + "cm";  //TODO: magic numbers...
			}
		}
	};
});