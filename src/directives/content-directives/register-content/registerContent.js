TallySheets.directive('registerContent', ['Config', 'PageConfigReader', '$q', function (config, PageConfigReader, $q) {
	return {
		restrict: 'E',
		template: require('./registerContentView.html'),
		scope: {
			content: '='
		},

        link: function($scope) {
            $q.when({})
				.then(PageConfigReader.getPageConfig)
				.then(function (pageConfig) {
					var landScapeAvailableWidth = pageConfig.width - (pageConfig.components.border.left + pageConfig.components.border.left);
                	$scope.rows = new Array(Math.floor((landScapeAvailableWidth - config.Register.pageHeaderHeight - config.Register.tableHeaderHeight) / config.Register.dataEntryRowHeight));
            })

			$scope.units = config.Metrics.mm;
			$scope.widthOfSNOColumn = config.Register.widthOfSNOColumn + config.Metrics.mm;
			$scope.tableHeaderHeight = config.Register.tableHeaderHeight + config.Metrics.mm;
			$scope.rowHeight = config.Register.dataEntryRowHeight + config.Metrics.mm;
        }
	};
}]);
