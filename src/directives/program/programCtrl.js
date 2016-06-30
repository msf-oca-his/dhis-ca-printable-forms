TallySheets.directive('program', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/program/programView.html',
        scope: {
            contents: '=',
            mode: '=',
            programName: '=',
            isLastPage: '='
        }
    };
});

TallySheets.controller('programCtrl', ['$scope','Config', function($scope, config){
    $scope.rows = Array(Math.floor((config.Register.availableHeight - config.Register.headerHeight - config.Register.labelHeight)/ config.Register.dataEntryRowHeight));
    $scope.getClass = function(dataElement){
        return (dataElement.type == 'TEXT') ? 'deField text' : 'deField general'
    };
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm";

        }
        else return "9.5cm";
    }
}]);
