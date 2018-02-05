TallySheets.directive('datasetTitle', ['$rootScope','Config',function($rootScope,Config) {
	return {
		restrict: 'E',
		template: require('./datasetTitleView.html'),
		scope: {
			content: '='
		},
		link:function($scope) {
			$scope.headerName = $scope.content.title;
			$scope.maxLength = Config.DataSet.maximumCharLengthForHeader;
			$scope.update = function() {
				if(_.isEmpty($scope.headerName)) {
					$scope.headerName = $scope.content.title;
				} else {
					_.map($rootScope.cachedTemplates, function(cachedTemplate) {
						if(cachedTemplate.displayName == $scope.content.title) {
							cachedTemplate.displayName = $scope.headerName;
							$scope.content.title = $scope.headerName;
						}
					});
					$rootScope.renderTemplates();
				}
			}
		}
	}
}]);