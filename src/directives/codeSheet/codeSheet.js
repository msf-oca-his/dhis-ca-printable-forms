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
			$scope.rowHeight = config.CodeSheet.heightOfOption;
			$scope.rows = new Array(Math.floor((config.CodeSheet.availableHeight - config.CodeSheet.heightOfProgramTitle - config.CodeSheet.heightOfDataElement) / config.CodeSheet.heightOfOption));
		}
	}
}]);