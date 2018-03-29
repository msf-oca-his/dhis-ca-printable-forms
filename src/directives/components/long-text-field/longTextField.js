TallySheets.directive('longTextField', [function() {
	return {
		restrict: 'E',
		template: require('./longTextFieldView.html'),
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