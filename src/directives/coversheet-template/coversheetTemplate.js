TallySheets.directive('coversheetTemplate', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./coversheetTemplateView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		},
		link: function($scope) {
			if(config.customAttributes.displayOptionUID)
				$scope.displayOptions = config.customAttributes.displayOptionUID.options;
		}
	}
}]);
