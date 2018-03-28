TallySheets.directive('templateTitle', ['$rootScope','Config',function($rootScope,Config) {
	return {
		restrict: 'E',
		template: require('./titleView.html'),
		scope: {
			component: '='
		},
		link:function($scope) {
			$scope.headerName = $scope.component.title;
			$scope.maxLength = Config.DataSet.maximumCharLengthForHeader;
			$scope.update = function() {
				if(_.isEmpty($scope.headerName)) {
					$scope.headerName = $scope.component.title;
				} else {
					_.map($rootScope.cachedTemplates, function(cachedTemplate) {
						if(cachedTemplate.displayName == $scope.component.title) {
							cachedTemplate.displayName = $scope.headerName;
							$scope.component.title = $scope.headerName;
						}
					});
					$rootScope.renderTemplates();
				}
			}
		}
	}
}]);