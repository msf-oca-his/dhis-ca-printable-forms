TallySheets.directive('templateSelector', function() {
  return {
    restrict: 'E',
    template: require('./templateSelectorView.html'),
    scope: {
      selectorId: '=',
      bindToDataset: '=',
      onSelectDataset: '&'
    }
  };
});
TallySheets.controller('templateSelectorCtrl', [ '$scope', '$rootScope', 'DataSetService', 'ProgramService', 'Config', function($scope, $rootScope, DataSetService, ProgramService, config) {
  $scope.id = "dsSelector" + $scope.selectorId;
  $scope.selectorLoaded = false;
  $scope.dataSetPrefix = config.Prefixes.dataSetPrefix;
  $scope.programPrefix = config.Prefixes.programPrefix;

  DataSetService.getAllDataSets()
    .then(function(dataSets) {
      $scope.dataSetList = dataSets;
      $rootScope.$apply()
    });

  ProgramService.getAllPrograms()
    .then(function(programs) {
      console.log(programs)
      $scope.programList = programs;
    });


  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    // Refresh bootstrap-select
    $('.selectpicker').selectpicker('refresh');
    $('.selectpicker').selectpicker('render');
    $scope.selectorLoaded = true;
  });

  $(document).on('change', '#' + $scope.id, function() {
    $scope.selectorId = this.value;
    $scope.bindToDataset.id = this.value;
    $scope.bindToDataset.type = this.selectedOptions[ 0 ].getAttribute("data-type");
    if( $scope.selectorId ) {
      $scope.onSelectDataset()
    }
    $rootScope.$apply();
  });
} ]);
