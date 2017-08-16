describe("tree-component Directive", function() {
  var $controller;
  var treecomponentElement, pageTypes, treeNodeTypes;
  var outerScope, compile, childScope;
  var dataSetService = {}, programService = {}, templatesToJsTreeNodesService = {},dataSet = {};
  var getTemplateFor = function(id){return {data:{id: id}}};

  beforeEach(function() {
    angular.module('d2HeaderBar', []);
    templatesToJsTreeNodesService.getJsTreeNodes = function(a, b){return a;};
    module("TallySheets", function($provide, $translateProvider) {
      $translateProvider.translations('en', {
        "apply_changes": "applying changes"
      });
      $translateProvider.use('en');
      $provide.value('DataSetService', dataSetService);
      $provide.value('ProgramService', programService);
      $provide.value('TemplatesToJsTreeNodesService', templatesToJsTreeNodesService);
    });

    inject(function(_$controller_, $compile, $rootScope, PageTypes, TreeNodeTypes) {
      $controller = _$controller_;
      outerScope = $rootScope.$new();
      childScope = outerScope.$new();
      compile = $compile;
      pageTypes = PageTypes;
      treeNodeTypes = TreeNodeTypes;
    })
  });

  describe("On element creation", function() {
    beforeEach(function() {
      templatesToJsTreeNodesService.getJsTreeNodes = function(a, b) {
        return a;
      };
      dataSetService.getReferentialDataSetById = function(id) {
        return id;
      };
      childScope.selectedTemplatesType = pageTypes.DATASET;
      childScope.templatesCustomizations = [];
    });
    describe("when there are no templates", function() {
      it("should hide render button", function() {
        childScope.templates = [];
        treecomponentElement = compile('<tree-component templates="templates" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(_.isEmpty(treecomponentElement[ 0 ].querySelector('button'))).toBe(true);
      });

      it("should not draw trees", function() {
        childScope.templates = [];
        treecomponentElement = compile('<tree-component templates="templates" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(_.isEmpty(treecomponentElement[ 0 ].querySelector('js-tree'))).toBe(true);
      });
    });

    describe("when there are  templates", function() {
      it("should show render button", function() {
        childScope.templates = _.map([ 1, 2, 3, 4 ], getTemplateFor);
        treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(treecomponentElement[ 0 ].querySelector('button').textContent).toEqual('applying changes');
        expect(_.isEmpty(treecomponentElement[ 0 ].querySelector('button'))).toBe(false);
      });

      it("should draw trees depending on templates present", function() {
        childScope.templates = _.map([ 1, 2, 3, 4 ], getTemplateFor);
        treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(_.isEmpty(treecomponentElement[ 0 ].querySelector('button'))).toBe(false);
      });
    });
  });

  describe("onTemplatesSelectionChanged", function() {
    describe("action remove", function() {
      beforeEach(function(){
        childScope.templates = _.map([1, 2, 3], getTemplateFor);
        childScope.selectedTemplatesType = pageTypes.DATASET;
        treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
      });
      describe("at position 0", function() {
        it("should remove root node from position 0", function() {
          childScope.$broadcast('templatesSelectionChanged', [], 'remove', 0);
          childScope.$apply();
          expect(childScope.$$childHead.rootNodes).toEqual([ 2, 3 ]);
        });
      });
      describe("at position 1", function() {
        it("should remove root node from position 1", function() {
          childScope.$broadcast('templatesSelectionChanged', [], 'remove', 1);
          childScope.$apply();
          expect(childScope.$$childHead.rootNodes).toEqual([ 1, 3 ]);
        });
      });
    });

    describe("action select", function() {
      beforeEach(function(){
        templatesToJsTreeNodesService.getJsTreeNodes = function(a, b){return a;};
        childScope.selectedTemplatesType = pageTypes.DATASET;
      });

      it("should change root node at position 0 when a template is selected at position 0", function() {
        childScope.templates = [getTemplateFor(4)];
        treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(childScope.$$childHead.rootNodes).toEqual([4]);
        childScope.templates[0] = getTemplateFor(1);
        childScope.$broadcast('templatesSelectionChanged', childScope.templates, 'select', 0);
        childScope.$apply();
        expect(childScope.$$childHead.rootNodes).toEqual([1]);
      });

      it("should change root node at position 2 when selecting a template at position 2", function() {
        childScope.templates = [getTemplateFor(1)];
        treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
        childScope.$apply();
        expect(childScope.$$childHead.rootNodes).toEqual([1]);
        childScope.templates.push(getTemplateFor(2));
        childScope.$broadcast('templatesSelectionChanged', childScope.templates, 'select', 1);
        childScope.$apply();
        expect(childScope.$$childHead.rootNodes[1]).toEqual(2);
      });
    });
  });
  describe("customize tree selection", function(){
    var treeInstance, eventData, dataElementNode, sectionNode, renderSpy, expectedCustomizations;
    beforeEach(function(){
      dataSet.name = 'dataSet';
      dataSet.sections = [
          {dataElements: ['s1de1', 's1de2']}, {dataElements: ['s2de1', 's2de2']}
        ];
      sectionNode = {original: {index: 0, type: treeNodeTypes.SECTION}, state: {selected: true}};
      dataElementNode = {original: {index: 0, type: treeNodeTypes.DATAELEMENT}, parent: sectionNode};
      treeInstance = {get_node: function(){return sectionNode}, element: {attr: function(){return 0}}, is_selected: function(node){return node.state.selected}, is_undetermined: function(node){return node.state.undetermined}};
      eventData = {action: 'deselect node', instance: treeInstance, node: dataElementNode};
      dataSetService.getReferentialDataSetById = function(){return dataSet};
      childScope.templates = [getTemplateFor(1)];
      childScope.selectedTemplatesType = pageTypes.DATASET;
      childScope.templatesCustomizations = [];
      expectedCustomizations = [{partialSectionRemoval: {}, completeSectionRemoval: {}}];
      treecomponentElement = compile('<tree-component templates="templates" selected-templates-type="selectedTemplatesType" on-render="onRender(customizedTemplates)" templates-customizations="templatesCustomizations"></tree-component>')(childScope);
      childScope.$apply();
    });
    describe("on unchecking", function(){
      describe("1st data element of 1st section", function(){
        it("should add that dataelement to customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].partialSectionRemoval[0]={'0':{}};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
      describe("2nd data element of 1st section", function(){
        it("should add dataelement to customizations", function(){
          eventData.action = 'deselect_node';
          dataElementNode.original.index = 1;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].partialSectionRemoval[0]={'1':{}};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
      describe("1st data element of 2nd section", function(){
        it("should add dataelement to customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.original.index = 1;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].partialSectionRemoval[1]={'0':{}};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
      describe("2nd data element of 2nd section", function(){
        it("should add dataelement to customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.original.index = 1;
          dataElementNode.original.index = 1;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].partialSectionRemoval[1]={'1':{}};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
      describe("all dataelements of a section", function() {
        it("should add entire section to customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.original.index = 0;
          dataElementNode.original.index = 0;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          eventData.action = 'deselect_node';
          sectionNode.original.index = 0;
          dataElementNode.original.index = 1;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = false;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].completeSectionRemoval[0]={};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        })
      });
      describe("1st section", function(){
        it("should add section to customizations", function(){
          eventData.action = 'deselect_node';
          eventData.node = sectionNode;
          sectionNode.original.index = 0;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = false;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].completeSectionRemoval[0]={};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
        describe("and selecting data element from 1st section", function(){
          it("should remove that section and data element selected from customizations", function(){
            eventData.action = 'deselect_node';
            eventData.node = sectionNode;
            sectionNode.original.index = 0;
            sectionNode.state.selected = false;
            sectionNode.state.undetermined = false;
            childScope.$$childHead.onTreeSelectionChanged("event", eventData);
            eventData.action = 'select_node';
            eventData.node = dataElementNode;
            sectionNode.original.index = 0;
            sectionNode.state.undetermined = true;
            dataElementNode.original.index = 1;
            childScope.$$childHead.onTreeSelectionChanged("event", eventData);
            expectedCustomizations[0].partialSectionRemoval[0]={'0':{}};
            console.log(expectedCustomizations, childScope.templatesCustomizations);
            expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
          })
        })
      });
      describe("2nd section", function(){
        it("should add section into customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.original.index = 1;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = false;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].completeSectionRemoval[1]={};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
    });
    describe("on rechecking", function(){
      describe("data element", function(){
        it("should remove dataelement from customizations", function(){
          eventData.action = 'deselect_node';
          sectionNode.original.index = 0;
          dataElementNode.original.index = 0;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = true;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          eventData.action = 'select_node';
          sectionNode.original.index = 0;
          dataElementNode.original.index = 0;
          sectionNode.state.selected = true;
          sectionNode.state.undetermined = false;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expectedCustomizations[0].partialSectionRemoval[0] = {};
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
      describe("section", function(){
        it("should remove entire section from customizations", function(){
          eventData.action = 'deselect_node';
          eventData.node = sectionNode;
          sectionNode.original.index = 0;
          sectionNode.state.selected = false;
          sectionNode.state.undetermined = false;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          eventData.action = 'select_node';
          sectionNode.original.index = 0;
          sectionNode.state.selected = true;
          sectionNode.state.undetermined = false;
          eventData.node = sectionNode;
          childScope.$$childHead.onTreeSelectionChanged("event", eventData);
          expect(childScope.templatesCustomizations).toEqual(expectedCustomizations);
        });
      });
    });
  })
});