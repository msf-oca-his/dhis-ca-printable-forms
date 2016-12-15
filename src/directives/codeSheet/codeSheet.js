TallySheets.directive('codeSheet', ['Config', 'CodeSheetElementTypes', function(config, CodeSheetElementTypes) {
	return {
		restrict: 'E',
		template: require('./codeSheetView.html'),
		scope: {
			columns: '=',
			programName: '='
		},
		link: function($scope) {
			$scope.rowHeight = config.CodeSheet.rowHeight;
			$scope.getClass = function(codesheetElement) {
				switch(codesheetElement.type) {
					case CodeSheetElementTypes.HEADING:
						return 'optionHeading';
						break;
					case CodeSheetElementTypes.LABEL:
						return 'optionLabel';
						break;
					default:
						return 'optionGap';
						break;
				}
			};
		}
	}
}]);