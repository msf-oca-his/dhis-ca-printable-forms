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
			if(config.CustomAttributes.displayOptionUID)
				$scope.displayOptions = config.CustomAttributes.displayOptionUID.options;
		}
	}
}]);
