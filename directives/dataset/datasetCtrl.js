TallySheets.directive('dataset', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/dataset/datasetView.html',
        scope: {
            contents: '='
        }
    };
});

TallySheets.controller('datasetCtrl', ['$scope', function($scope){
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";

        }
        else return "9.5cm";
    }
}]);
