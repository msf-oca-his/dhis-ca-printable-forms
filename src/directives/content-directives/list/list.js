TallySheets.directive('list', ['Config', function(config) {
	return {
    restrict: 'E',
    template: require('./listView.html'),
    scope: {
      content: '='
    },
    link: function($scope) {
    	$scope.optionWidth = (config.PageTypes.A4.Portrait.availableWidth - config.OptionSet.dataElementLabelWidth) / config.OptionSet.numberOfColumns + config.Metrics.mm;
    	$scope.optionHeight = config.OptionSet.heightOfOption + config.Metrics.mm;
    	$scope.dataElementLabelWidth = config.OptionSet.dataElementLabelWidth + config.Metrics.mm;
    	$scope.dataElementLabelHeight = config.OptionSet.dataElementLabelHeight + config.Metrics.mm;
    }
  }
}]);