TallySheets.directive('templateCoversheet', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateCoversheetView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		},
		link: function($scope) {
			$scope.displayOptions = config.CustomAttributes.displayOptionUID.options;
		}
	}
}]);