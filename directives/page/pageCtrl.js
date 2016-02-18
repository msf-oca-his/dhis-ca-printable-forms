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
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            console.log("returning "+ (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm");
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";

        }
        else return "9.5cm";
    }
}]);
