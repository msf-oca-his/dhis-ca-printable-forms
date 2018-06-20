TallySheets.directive('codeSheet', ['Config', 'CodeSheetElementTypes','$q','PageConfigReader', function(config, CodeSheetElementTypes, $q, PageConfigReader) {
	return {
		restrict: 'E',
		template: require('./codeSheetView.html'),
		scope: {
			columns: '=',
			programName: '='
		},
		link: function($scope) {
			$q.when({}).then(PageConfigReader.getPageConfig).then(function (pageConfig) {
                var availableWidth = pageConfig.width - (pageConfig.components.border.left + pageConfig.components.border.right);
                var columnWidth = availableWidth / config.CodeSheet.numberOfColumns - 1;
                $scope.columnWidth = availableWidth / config.CodeSheet.numberOfColumns + config.Metrics.mm;
                $scope.widthOfCode = config.CodeSheet.widthOfCode+ config.Metrics.mm;
                $scope.widthOfOption = (columnWidth - config.CodeSheet.widthOfCode)+ config.Metrics.mm;
			});
			$scope.rowHeight = config.CodeSheet.rowHeight + config.Metrics.mm;
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