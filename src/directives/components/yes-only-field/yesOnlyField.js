TallySheets.directive('yesOnlyField', [function() {
    return {
        restrict: 'E',
        template: require('./yesOnlyFieldView.html'),
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