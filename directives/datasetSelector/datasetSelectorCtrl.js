TallySheets.directive('datasetSelector', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/datasetSelector/datasetSelectorView.html',
        scope: {
            selectorId: '=',
            bindToDataset: '=',
            selectDataset: '&'
        }
    };
});
TallySheets.controller('datasetSelectorCtrl', ['$scope', '$rootScope', 'DataSetsUID', 'ProgramsUID', function($scope, $rootScope, DataSetsUID, ProgramsUID){

    $scope.id = "dsSelector" + $scope.selectorId;

    $scope.selectorLoaded = false;

    DataSetsUID.get().$promise.then(function(result){
        _.map(result.dataSets, function(dataset){
              dataset.type = "dataset"
        });
        $scope.dataSetList = result.dataSets;

        ProgramsUID.get().$promise.then(function(result){
            _.map(result.programStages, function(program){
                program.type = "program"
                $scope.dataSetList.push(program);
            });
        });
    });



    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        // Refresh bootstrap-select
        $('.selectpicker').selectpicker('refresh');
        $('.selectpicker').selectpicker('render');
        $scope.selectorLoaded = true;
    });

    $(document).on('change', '#' + $scope.id ,function(){
        var dsId = $("option:selected", this).val();
        var dsName = $("option:selected", this).html().trim();
        var dsType = $("option:selected", this)[0].dataset.type;
        $scope.selectorId = dsId;
        $scope.bindToDataset.id = dsId;
        $scope.bindToDataset.name = dsName;
        $scope.bindToDataset.type = dsType;
        if(dsId && dsType == 'dataset') {
          $scope.selectDataset()
        }
        $rootScope.$apply();
    });

}]);
