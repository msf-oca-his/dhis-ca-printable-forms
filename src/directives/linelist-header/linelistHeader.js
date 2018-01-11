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
					_.map($rootScope.cachedProgramNames, function(cachedProgram) {
						if(cachedProgram.displayName == $scope.programName) {
							cachedProgram.displayName = $scope.headerName;
							$scope.programName = $scope.headerName;
							$rootScope.renderTemplates([cachedProgram]);
						}
					});
				}
			}
		}
	}
}]);
