describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer, $q, $provide;
	var _$rootScope;
	var mockedTemplatesToJsTreeNodesService;
	var mockedDataSetService;
	var mockedDataSetProcessor;
	var mockedProgramService;
	var mockedProgramProcessor;
	var expectedPages;
	var mockedValidationService;
	var mockDataset;
	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);

		module(function(_$provide_) {
			$provide = _$provide_;
		});

		inject(function(_$q_) {
			$q = _$q_;
		});

    mockDataset = {
      id: 'dsid',
      sections : [
        {
          id: 'sec1',
          dataElements: [
            {id: 'de1'},
            {id: 'de2'}
          ]
        },
        {
          id: 'sec2',
          dataElements: [
            {id: 'de1'},
            {id: 'de2'}
          ]
        }
      ]
    };
		var mockProgram = "testProgram";
    var mockedNodes = "testNodes";
		expectedPages = "testPages";

		mockedDataSetService = {
			getReferentialDataSetById: function() {
				return $q.when(mockDataset);
			}
		};
		mockedTemplatesToJsTreeNodesService ={
			getJsTreeNodes : function(template) {
				return mockedNodes;
      }
		};
		mockedProgramService = {
			getProgramById: function() {
				return $q.when(mockProgram);
			}
		};
		mockedDataSetProcessor = {
			process: function() {
				if(_.isEmpty(arguments[0]))
					return [];
				return expectedPages;
			}
		};

		mockedProgramProcessor = {
			process: function() {
				if(_.isEmpty(arguments[0]))
					return [];
				return expectedPages;
			}
		};

		mockedValidationService = {
			validate: function() {
				return $q.when({});
			}
		};

		$provide.value('OptionSetFactory', $q.when({}));
		$provide.value('DataSetService', mockedDataSetService);
		$provide.value('DataSetProcessor', mockedDataSetProcessor);
		$provide.value('ProgramService', mockedProgramService);
		$provide.value('ProgramProcessor', mockedProgramProcessor);
		$provide.value('CustomAttributeValidationService', mockedValidationService);
		$provide.value('TemplatesToJsTreeNodesService', mockedTemplatesToJsTreeNodesService);
		$provide.value('CoversheetProcessor', mockedProgramProcessor);
		$provide.value('CodeSheetProcessor', mockedProgramProcessor);
		$provide.value('RegisterProcessor', mockedProgramProcessor);
		$provide.value('appLoadingFailed', false);

		inject(function(_$controller_, $rootScope) {
			_$rootScope = $rootScope;
			defer = $q.defer();
			scope = _$rootScope.$new();
			$controller = _$controller_;
		});

		$controller('TallySheetsController', {$scope: scope});
	});

	describe("render templates", function() {//both of these are not valid now.
		// it("should not render template if it doesn't have template id", function() {
		// 	var template = {};
		// 	scope.templates = [template];
		// 	scope.selectedTemplatesType = 'DATASET';
		// 	scope.renderTemplates();
		// 	scope.$apply();
		// 	expect(scope.spinnerShown).toBe(false);
		// 	expect(scope.pages).toEqual([]);
		// });

		// it("should render the templates if there is a valid template selected", function() {
		// 	var template = {type: 'DataSet',data:{id:'143'},displayName:"tally_ds1"};
		// 	scope.templates = [template];
		// 	scope.selectedTemplatesType = 'DATASET';
		// 	scope.renderTemplates();
		// 	scope.$apply();
		// 	expect(scope.spinnerShown).toEqual(false);
		// 	expect(scope.pages).toEqual(expectedPages);
		// });

		it("should render the programs if it has template id", function() {
			scope.templates = [{id: 'blah',data:{id:'1'},displayName:"perPt_prog1"}];
			scope.selectedTemplatesType = "PROGRAM";
			scope.programMode = "COVERSHEET";
			scope.renderTemplates();
			scope.$apply();
			expect(scope.spinnerShown).toEqual(false);
			expect(scope.pages).toEqual(expectedPages);
		});

		it("should not render the template which is neither program nor dataset", function() {
			scope.selectedTemplatesType = "testType";
			scope.renderTemplates();
			scope.$apply();
			expect(scope.spinnerShown).toEqual(false);
			expect(scope.pages).toEqual([]);
		});
	});

	describe("onTemplateSelectionChanged", function() {
		describe("action remove", function() {
			describe("at position 0", function() {
        it("should remove root node from position 0", function(){
          scope.rootNodes = [1, 2, 3];
          scope.onTemplateSelectionChanged([], 'remove', 0);
          scope.$apply();
          expect(scope.rootNodes).toEqual([2, 3]);
        });
      });
      describe("at position 1", function() {
        it("should remove root node from position 1", function() {
          scope.rootNodes = [ 1, 2, 3 ];
          scope.onTemplateSelectionChanged([], 'remove', 1);
          scope.$apply();
          expect(scope.rootNodes).toEqual([ 1, 3 ]);
        });
      });
    });

		describe("action select", function() {
			it("should change root node at position 0 when a template is selected at position 0", function() {
				scope.templates = [{data: {id: "1"}}, 2, 3];
        scope.rootNodes = [0, 1, 2];
        scope.onTemplateSelectionChanged(scope.templates, 'select', 0);
        scope.$apply();
        expect(scope.rootNodes).toEqual(['testNodes', 1, 2]);
      });

      it("should change root node at position 2 when selecting a template at position 2", function() {
        scope.templates = [1, 2, {data: {id: "1"}}];
        scope.rootNodes = [0, 1, 2];
        scope.onTemplateSelectionChanged(scope.templates, 'select', 2);
        scope.$apply();
        expect(scope.rootNodes).toEqual([0, 1, 'testNodes']);
      });
    });
  });

  describe("tree customizations", function(){
  	describe("when there are no customizations", function(){
      it("should not customize anything in templates", function(){
        var templates = [{data : mockDataset}];
        scope.selectedTemplatesType = "DATASET";
        scope.onTemplateSelectionChanged(templates, 'select', 0);
        scope.$apply();
        spyOn(mockedDataSetProcessor, 'process').and.callThrough();
        scope.renderTemplates();
        scope.$apply();
        expect(mockedDataSetProcessor.process).toHaveBeenCalledWith([mockDataset]);
        mockedDataSetProcessor.process.calls.reset();
      });
		});

    describe("when 1st data element of 1st section is unchecked", function(){
      it("should remove that data element from dataset", function(){
        var templates = [{data : mockDataset}];
        scope.selectedTemplatesType = "DATASET";
        scope.onTemplateSelectionChanged(templates, 'select', 0);
        scope.$apply();
        spyOn(mockedDataSetProcessor, 'process').and.callThrough();
        var changeData = {
        	action: 'deselect_node',
					instance: {get_node: function(){return _.set({}, 'original.index', 0)}, element: {attr: function(){return 0}}},
					node: _.set({}, 'original.index', 0)
				};
        scope.onTreeSelectionChanged(undefined, changeData);
        scope.$apply();
        scope.renderTemplates();
        scope.$apply();
        var customizedDataSet = _.cloneDeep(mockDataset);
        _.pullAt(customizedDataSet.sections[0].dataElements, 0);
        expect(mockedDataSetProcessor.process).toHaveBeenCalledWith([customizedDataSet]);
        mockedDataSetProcessor.process.calls.reset();
      });
    });
  });
});