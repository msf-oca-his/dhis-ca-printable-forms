TallySheets.directive('textField', [function() {
	return {
		restrict: 'E',
		template: require('./textFieldView.html'),
		scope: {
			component: '='
		},
		link: function($scope) {
			$scope.getStyles = function() {
				return "height:" + $scope.height + "mm";
			}	
		}
	};
}]);