TallySheets.directive('optionField', [function() {
    return {
        restrict: 'E',
        template: require('./optionFieldView.html'),
        scope: {
            component: '='
        },
        link: function($scope) {
        }
    };
}]);