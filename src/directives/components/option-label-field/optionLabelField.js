TallySheets.directive('optionLabelField', [function() {
    return {
        restrict: 'E',
        template: require('./optionLabelFieldView.html'),
        scope: {
            component: '='
        },
        link: function($scope) {
        }
    };
}]);