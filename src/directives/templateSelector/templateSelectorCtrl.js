TallySheets.directive('templateSelector', [ '$rootScope', '$window', '$timeout', '$translate', 'DataSetService', 'ProgramService', 'CustomAttributeService', 'Config', function($rootScope, $window, $timeout, $translate, DataSetService, ProgramService, CustomAttributeService, config) {
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


      //TODO: Making api call to show detailed messages to user
      //TODO: UX input: How should alerts be handled ?
      var loadTemplates = function() {
        var alertShown = false;

        //checking whether custom attribute present in config or not
        if( config.Attributes.printableUID === undefined ) {
          Promise.all([ DataSetService.getAllDataSets(), ProgramService.getAllPrograms() ])
            .then(function(templates) {
              $scope.templates = _.flatten(templates);

              $rootScope.$apply();
              refreshBootstrapSelect();
            })
        }
        else {
          Promise.all([ CustomAttributeService.getCustomAttribute(config.Attributes.printableUID) ])
            .then(function(customAttribute) {

              var attribute = _.flatten(customAttribute);
              //checking whether custom attribute exists in system or not
              if( attribute[ 0 ] === undefined ) {
                $translate('NO_ATTRIBUTE_EXISTS').then(function(translatedValue) {
                  alertShown = true;
                  alert(translatedValue);
                });
              }
              else {
                //checking whether custom attribute associated to dataSets/programs or not
                if( attribute[ 0 ] != undefined && (!attribute[ 0 ].dataSetAttribute || !attribute[ 0 ].programAttribute) ) {
                  $translate('NO_ASSOCIATION_WITH_ATTRIBUTE').then(function(translatedValue) {
                    alertShown = true;
                    alert(translatedValue);
                  });
                }
                else {
                  Promise.all([ DataSetService.getAllDataSets(), ProgramService.getAllPrograms() ])
                    .then(function(templates) {
                      $scope.templates = [];
                      var yes = "true";

                      _.map(_.flatten(templates), function(template) {
                        var printableAttribute = getPrintableAttribute(template.attributeValues);
                        //checking whether the template has that custom attribute along with value as true
                        if( printableAttribute && printableAttribute.value == yes ) {
                          $scope.templates.push(template)
                        }
                      });
                      //checking if none of the template has the custom attribute set
                      if( $scope.templates.length == 0 && !alertShown ) {
                        $translate('ATTRIBUTE_NOT_SET').then(function(translatedValue) {
                          alert(translatedValue);
                        });
                      }
                      $rootScope.$apply();
                      refreshBootstrapSelect();
                    })
                }
              }

            })
        }
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
