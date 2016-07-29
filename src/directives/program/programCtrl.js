TallySheets.directive('program', function(){
    return{
        restrict: 'E',
        template: require('./programView.html'),
        scope: {
            contents: '=',
            mode: '=',
            programName: '=',
            isLastPage: '='
        }
    };
});
//TODO: no need of extra controller.. add this code to link.
TallySheets.controller('programCtrl', ['$scope','Config', function($scope, config){
    $scope.displayOptions = config.DisplayOptions;
    $scope.rows = Array(Math.floor((config.Register.availableHeight - config.Register.headerHeight - config.Register.labelHeight)/ config.Register.dataEntryRowHeight));
    $scope.getClass = function(dataElement){
        return (dataElement.valueType == 'TEXT') ? 'deField text' : 'deField general'
    };
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm"; //TODO: Magic Numbers
        }
        else return "9.5cm";
    }
}]);
