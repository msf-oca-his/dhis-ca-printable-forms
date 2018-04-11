TallySheets.directive('catCombSection', [function() {
    return {
        restrict: 'E',
        template: require('./catCombSectionView.html'),
        scope: {
            component: '='
        },
        link: function($scope) {}
    };
}]);