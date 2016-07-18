TallySheets.directive('dataset', function(){
    return{
        restrict: 'E',
        template: require('./datasetView.html'),
        scope: {
            contents: '=',
            datasetName: '='
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
