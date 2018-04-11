TallySheets.directive('catCombField', ['Config', function(Config) {
    return {
        restrict: 'E',
        template: require('./catCombFieldView.html'),
        scope: {
            component: '='
        },
        link: function($scope) {
            $scope.widthOfDataElementLabel = $scope.component.config.widthOfDataElement + Config.Metrics.mm;
            $scope.heightOfTableHeader = $scope.component.config.heightOfCatCombTableHeader + Config.Metrics.mm;
            $scope.heightOfDataElement = $scope.component.config.heightOfDataElement + Config.Metrics.mm;
            $scope.widthOfDataElementField = $scope.component.config.widthOfCategoryOptionCombo + Config.Metrics.mm;
            $scope.topMargin = $scope.component.config.gapBetweenSectionAndTable + Config.Metrics.mm;
            $scope.getTableWidth = function(categoryOptionCombos) {
                return (categoryOptionCombos.length * $scope.component.config.widthOfCategoryOptionCombo + $scope.component.config.widthOfDataElement + 1) + Config.Metrics.mm;
            };
            $scope.isGreyFieldCatCombOption = function(index,greyedFieldIndexes) {
                return _.includes(greyedFieldIndexes, index)
            }
        }
    };
}]);