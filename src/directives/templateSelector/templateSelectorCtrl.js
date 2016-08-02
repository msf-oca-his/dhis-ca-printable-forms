TallySheets.directive('templateSelector', [ '$rootScope', '$timeout', 'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', function($rootScope, $timeout, DataSetService, ProgramService, CustomAttributeService, config) {
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

      var getPrintableAttribute = function(attributeValues) {
        return _.reduce(_.filter(attributeValues, function(attributeValue) {
          if( attributeValue.attribute.id === config.Attributes.printableUID ) {
            return attributeValue;
          }
        }));
      };

      var isAttributeExistsInSystem = function() {
        var isAttributeExists = false;
        return Promise.all([ CustomAttributeService.getAllCustomAttributes() ])
          .then(function(customAttributes) {
            console.log(_.flatten(customAttributes), 'attributes');

            _.map(_.flatten(customAttributes), function(customAttribute) {
              if( customAttribute.id == config.Attributes.printableUID ) {
                isAttributeExists = true;
              }
            });
            return isAttributeExists;

          })
      };

      var loadTemplates = function() {

        var data = isAttributeExistsInSystem().then(function(data) {
          if( !data ) {
            alert("Specified UID doesn't exists in system.Please contact the system administrator.");
          }
        });




        Promise.all([ DataSetService.getAllDataSets(), ProgramService.getAllPrograms() ])
          .then(function(dataSetsAndPrograms) {
            $scope.templates = [];

            if( config.Attributes.printableUID === undefined ) {
              $scope.templates = _.flatten(dataSetsAndPrograms);
            }


            _.map(_.flatten(dataSetsAndPrograms), function(template) {
              var printableAttribute = getPrintableAttribute(template.attributeValues);
              if( printableAttribute && printableAttribute.value == "true" ) {
                $scope.templates.push(template)
              }
            });

            console.log($scope.templates, 'templates');
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

TallySheets.filter('addPrefix', [ 'Config', function(config) {  //TODO: find a good name fo this filter...
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
