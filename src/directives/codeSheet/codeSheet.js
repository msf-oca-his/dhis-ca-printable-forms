TallySheets.directive('codeSheet', ['Config', function(config) {
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
					case 'HEADING':
						return 'optionHeading'; break;
					case 'LABEL':
						return 'optionLabel'; break;
					default:
						return 'optionGap'; break;
				}
			};
		}
	}
}]);