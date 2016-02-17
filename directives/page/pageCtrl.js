TallySheets.directive('page', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/page/pageView.html',
        scope: {
            selectorId: '=',
            bindToDataset: '=',
            page: '='
        }
    };
});

TallySheets.controller('pageCtrl', ['$scope', function($scope){
}]);
