TallySheets.directive('booleanField', [function() {
    return {
        restrict: 'E',
        template: require('./booleanFieldView.html'),
        scope: {
            component: '='
        },
        link: function($scope) {
            $scope.getStyles = function() {
                return "height:" + $scope.height + "mm";
            }
        }
    };
}]);