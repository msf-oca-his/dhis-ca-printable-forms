TallySheets.directive('linelistHeader', ['$rootScope', 'Config', function($rootScope, Config) {
	return {
		restrict: 'E',
		template: require('./linelistHeaderTemplate.html'),
		scope: {
			programName: '='
		},
		link: function($scope) {
			$scope.programMode = $scope.$parent.$parent.page.type;
			$scope.headerName = $scope.programName;
			$scope.maxLength = Config.Coversheet.maximumCharLengthForHeader;
			$scope.update = function() {
				if(_.isEmpty($scope.headerName)) {
					$scope.headerName = $scope.programName;
				} else {
					_.map($rootScope.cachedTemplates, function(cachedTemplate) {
						if(cachedTemplate.displayName == $scope.programName) {
							cachedTemplate.displayName = $scope.headerName;
							$scope.programName = $scope.headerName;
							$rootScope.renderTemplates();
						}
					});
				}
			}
		}
	}
}]);