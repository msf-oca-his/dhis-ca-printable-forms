TallySheets.directive('program', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/program/programView.html',
        scope: {
            contents: '=',
            mode: '='
        }
    };
});

TallySheets.controller('programCtrl', ['$scope', function($scope){
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";

        }
        else return "9.5cm";
    }
}]);
