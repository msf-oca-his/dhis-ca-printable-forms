TallySheets.directive('treeComponent', [ 'TemplatesToJsTreeNodesService', '$q', 'DataSetService', 'ProgramService', 'PageTypes', 'TreeNodeTypes', function(TemplatesToJsTreeNodesService, $q, DataSetService, ProgramService, PageTypes, TreeNodeTypes) {
  return {
    restrict: 'E',
    template: require('./tree-component-view.html'),
    scope: {
      templates: '=',
      selectedTemplatesType: '=',
      onRender: '&',
      templatesCustomizations: '='
    },
    link: function($scope) {
      $scope.templatesCustomizations = _.map($scope.templates, function(){return {completeSectionRemoval: {}, partialSectionRemoval: {}}});
      var getTemplateFromDHIS = function(id) {
        if($scope.selectedTemplatesType == PageTypes.DATASET)
          return DataSetService.getReferentialDataSetById(id);
        else if($scope.selectedTemplatesType == PageTypes.PROGRAM)
          return ProgramService.getProgramById(id);
      };

      var templatesFromDhis = _($scope.templates)
        .map('data.id')
        .map(getTemplateFromDHIS)
        .value();
      $scope.rootNodes = _(templatesFromDhis)
        .map(_.curryRight(TemplatesToJsTreeNodesService.getJsTreeNodes)($scope.selectedTemplatesType))
        .value();


      $scope.$on('templatesSelectionChanged', function(event, templates, action, position){
        var removeTreeAndCustomizationsAt = function(position){
          _.pullAt($scope.rootNodes, position);
          _.pullAt($scope.templatesCustomizations, position);
          _.pullAt(templatesFromDhis, position);
        };
        if(_.isEqual(action, 'remove')){
          removeTreeAndCustomizationsAt(position)
          $scope.$apply();
        }
        else if (_.isEqual(action, 'select')){
          $q.when(templates[position].data.id)
            .then(getTemplateFromDHIS)
            .then(function(template){
              templatesFromDhis[position]= template;
              $scope.rootNodes[position] = TemplatesToJsTreeNodesService.getJsTreeNodes(template, $scope.selectedTemplatesType);
              $scope.templatesCustomizations[position] = {completeSectionRemoval: {}, partialSectionRemoval: {}};
            });
        }

      });

      var getIndexOfTree = function(treeInstance){
        return treeInstance.attr('index');
      };

      $scope.render = function(){
        $scope.onRender({templates: templatesFromDhis});
      };

      $scope.onTreeSelectionChanged = function(event, data){
        if(!data.node || data.node.original.type == TreeNodeTypes.TEMPLATE)
          return;

        var dataElementNode, tree, sectionNode, currentTemplateCustomization;
        currentTemplateCustomization = $scope.templatesCustomizations[getIndexOfTree(data.instance.element)];

        var addSectionToCustomizations = function(currentTemplateCustomization, sectionIndex){
          _.merge(currentTemplateCustomization.completeSectionRemoval, {[sectionIndex] : {}});
          _.unset(currentTemplateCustomization.partialSectionRemoval, sectionIndex);
        };

        function removeSectionFromCustomizations(currentTemplateCustomization, sectionIndex) {
          _.unset(currentTemplateCustomization.partialSectionRemoval, sectionIndex);
          _.unset(currentTemplateCustomization.completeSectionRemoval, sectionIndex);
        }

        function addAllDataElementsOfSectionToCustomizations(currentTemplateCustomization, sectionIndex) {
          currentTemplateCustomization.partialSectionRemoval[sectionIndex] = {};
          var dataElementsArray;
          if(_.isEqual($scope.selectedTemplatesType, PageTypes.DATASET))
            dataElementsArray = templatesFromDhis[getIndexOfTree(data.instance.element)].sections[sectionIndex].dataElements;
          else if(_.isEqual($scope.selectedTemplatesType, PageTypes.PROGRAM))
            dataElementsArray = templatesFromDhis[getIndexOfTree(data.instance.element)].programStages[0].programStageSections[sectionIndex].programStageDataElements;
          _.map(dataElementsArray, function(de, index){
            currentTemplateCustomization.partialSectionRemoval[sectionIndex][index] = {};
          });

        }
        if(_.isEqual(data.action, 'deselect_node')){
          if(data.node.original.type == TreeNodeTypes.SECTION)
            addSectionToCustomizations(currentTemplateCustomization, data.node.original.index);
          else if(data.node.original.type == TreeNodeTypes.DATAELEMENT){
            dataElementNode = data.node;
            tree = data.instance;
            sectionNode = tree.get_node(dataElementNode.parent);
            if(tree.is_selected(sectionNode) || tree.is_undetermined(sectionNode))
              _.merge(currentTemplateCustomization.partialSectionRemoval, {[sectionNode.original.index] : {[dataElementNode.original.index]: {}}});
            else{
              addSectionToCustomizations(currentTemplateCustomization, sectionNode.original.index);
            }
          }
        }
        else if(_.isEqual(data.action, 'select_node')){
          if(data.node.original.type == TreeNodeTypes.SECTION){
            removeSectionFromCustomizations(currentTemplateCustomization, data.node.original.index);
          }
          else if(data.node.original.type == TreeNodeTypes.DATAELEMENT){
            dataElementNode = data.node;
            tree = data.instance;
            sectionNode = tree.get_node(dataElementNode.parent);
            if(currentTemplateCustomization.completeSectionRemoval[sectionNode.original.index]){
              _.unset(currentTemplateCustomization.completeSectionRemoval, sectionNode.original.index);
              _.unset(currentTemplateCustomization.partialSectionRemoval, sectionNode.original.index);
              addAllDataElementsOfSectionToCustomizations(currentTemplateCustomization, sectionNode.original.index);
              _.unset(currentTemplateCustomization.partialSectionRemoval[ sectionNode.original.index ], dataElementNode.original.index);
            }
            else{
              _.unset(currentTemplateCustomization.partialSectionRemoval[ sectionNode.original.index ], dataElementNode.original.index);
              _.unset(currentTemplateCustomization.completeSectionRemoval, sectionNode.original.index);
            }
          }
        }
      }
    }
  }
}]);