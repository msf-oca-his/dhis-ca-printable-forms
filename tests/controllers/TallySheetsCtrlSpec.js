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

	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);

		module(function(_$provide_) {
			$provide = _$provide_;
		});

		inject(function(_$q_) {
			$q = _$q_;
		});

		var mockDataset = "testDataSet";
		var mockProgram = "testProgram";
    var mockedNodes = "testNodes";
		expectedPages = "testPages";

		mockedDataSetService = {
			getReferentialDataSetById: function() {
				return $q.when(mockDataset);
			}
		};
		mockedTemplatesToJsTreeNodesService ={
      getJsTreeNodesFrom : function(template) {
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

	describe("render templates", function() {
		it("should not render template if it doesn't have template id", function() {
			var template = {};
			scope.templates = [template];
			scope.selectedTemplatesType = 'DATASET';
			scope.renderTemplates();
			scope.$apply();
			expect(scope.spinnerShown).toBe(false);
			expect(scope.pages).toEqual([]);
		});

		it("should render the templates if it there is a valid template selected", function() {
			var template = {type: 'DataSet',data:{id:'143'},displayName:"tally_ds1"};
			scope.templates = [template];
			scope.selectedTemplatesType = 'DATASET';
			scope.renderTemplates();
			scope.$apply();
			expect(scope.spinnerShown).toEqual(false);
			expect(scope.pages).toEqual(expectedPages);
		});

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

	describe("update trees", function() {
		describe("action remove", function() {
			it("should remove root node from position 1 when position is  1", function(){
        scope.rootNodes = [1, 2, 3];
        scope.updateTrees([], 'remove', 1);
        scope.$apply();
        expect(scope.rootNodes).toEqual([1, 3]);
			});

      it("should remove root node from position 0 when first template is deleted", function(){
        scope.rootNodes = [1, 2, 3];
        scope.updateTrees([], 'remove', 0);
        scope.$apply();
        expect(scope.rootNodes).toEqual([2, 3]);
      });
    });

		describe("action select", function() {
			it("should change root node at position 0 when a template is selected at position 0", function() {
				scope.templates = [{data: {id: "1"}}, 2, 3];
        scope.rootNodes = [0, 1, 2];
        scope.updateTrees(scope.templates, 'select', 0);
        scope.$apply();
        expect(scope.rootNodes).toEqual(['testNodes', 1, 2]);
      });

      it("should change root node at position 2 when selecting a template at position 2", function() {
        scope.templates = [1, 2, {data: {id: "1"}}];
        scope.rootNodes = [0, 1, 2];
        scope.updateTrees(scope.templates, 'select', 2);
        scope.$apply();
        expect(scope.rootNodes).toEqual([0, 1, 'testNodes']);
      });
    });
  })
});