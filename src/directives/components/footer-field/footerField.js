TallySheets.directive('footerField', [function() {
    return {
        restrict: 'E',
        template: require('./footerFieldView.html'),
        scope: {
            component: '='
        }
    };
}]);