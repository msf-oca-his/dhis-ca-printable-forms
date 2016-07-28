TallySheets.directive('templateSelector', [ '$rootScope', '$timeout', 'DataSetService', 'ProgramService', function($rootScope, $timeout, DataSetService, ProgramService) {
  return {
    restrict: 'E',
    template: require('./templateSelectorView.html'),
    scope: {
      onSelectDataset: '&',
      selectedTemplate: '='
    },
    link: function($scope, element) {
      $scope.selectedDataSet = {};
      $scope.selectorLoaded = false;

      var refreshBootstrapSelect = function() {
        $(element).find('.selectpicker').selectpicker('refresh');
        $(element).find('.selectpicker').selectpicker('render');
        $scope.selectorLoaded = true;
        $rootScope.$apply();
      };

      var loadTemplates = function(){
        Promise.all([ DataSetService.getAllDataSets(), ProgramService.getAllPrograms() ])
          .then(function(dataSetsAndPrograms) {
            $scope.templates = _.flatten(dataSetsAndPrograms);
            $rootScope.$apply();
            refreshBootstrapSelect();
          });
      };

      $scope.changeHandler = function() {
        if( $scope.selectedDataSet == null ) return;
        $scope.selectedTemplate.id = $scope.selectedDataSet.id;
        $scope.selectedTemplate.type = getTypeOfTemplate($scope.selectedDataSet);
        $scope.onSelectDataset();
      };
      loadTemplates();
    }
  };
} ]);

var getTypeOfTemplate = function(template) {
  if( template.constructor.name == "DataSet" )
    return "DATASET";
  else if( template.constructor.name == "Program" )
    return "PROGRAM";
};

TallySheets.filter('prependWithPrefix', [ 'Config', function(config) {
  return function(template) {
    var typeOfTemplate = getTypeOfTemplate(template)
    if( typeOfTemplate == "DATASET" )
      return config.Prefixes.dataSetPrefix + template.displayName;
    if( typeOfTemplate == "PROGRAM" )
      return config.Prefixes.programPrefix + template.displayName;
    else
      return template;
  }
} ]);
