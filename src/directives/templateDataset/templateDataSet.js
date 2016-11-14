TallySheets.directive('templateDataset', ['Config', function(config) {
	return {
		restrict: 'E',
		template: require('./templateDatasetView.html'),
		scope: {
			contents: '=',
			datasetName: '='
		},
		link: function($scope) {
			if(config.CustomAttributes.displayOptionUID)
				$scope.displayOptions = config.CustomAttributes.displayOptionUID.options;
			$scope.getTableWidth = function(section) {
				if(section.isCatComb) {
					return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * config.DataSet.widthOfCategoryOptionCombo + config.DataSet.widthOfDataElement) + "cm";
				}
				else return config.DataSet.availableWidthForDefaultSection + "cm";
			}
		}
	};
}]);
