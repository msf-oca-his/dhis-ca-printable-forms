TallySheets.directive('page', function(){
    return{
        restrict: 'E',
        template: require('./pageView.html'),
        scope: {
            page: '=',
            pageNumber: '=',
            totalPages: '=',
            type:'=',
            programMode: '='
        }
    };
});

TallySheets.controller('pageCtrl', ['$scope', function($scope){
    $scope.getTableWidth = function(section){
        if(section.isCatComb){
            return (section.dataElements[0].categoryCombo.categoryOptionCombos.length * 3 + 4) + "cm"; //TODO: magic numbers

        }
        else return "9.5cm";
    }
}]);
