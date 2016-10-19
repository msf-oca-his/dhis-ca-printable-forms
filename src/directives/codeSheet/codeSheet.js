TallySheets.directive('codeSheet', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./codeSheetView.html'),
		scope: {
			contents: '=',
			programName: '=',
			isLastPage: '='
		},
		link: function($scope){
			$scope.getClass = function(codesheet) {
				if (codesheet.type == 'Heading') 
					return 'explainerHeading';
				else if (codesheet.type == 'Label')
					return 'explainerLabel';
				else if (codesheet.type == 'Gap')
					return 'explainerGap';
			};
		}
	}
}]);