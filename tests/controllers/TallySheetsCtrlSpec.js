describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer, $q, $provide;
	var _$rootScope;
	var mockedTemplatesToJsTreeNodesService;
	var mockedDataSetService;
	var mockedDataSetProcessor;
	var mockedProgramService;
	var mockedCodesheetProcessor, mockedCoversheetProcessor, mockedRegisterProcessor;
	var expectedPages;
	var mockedValidationService;
	var mockDataset;
	var pageTypes;
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

    mockedCoversheetProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return "coversheet";
      }
    };
    mockedCodesheetProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return "codesheet";
      }
    };
    mockedRegisterProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return "register";
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
		$provide.value('CustomAttributeValidationService', mockedValidationService);
		$provide.value('TemplatesToJsTreeNodesService', mockedTemplatesToJsTreeNodesService);
		$provide.value('CoversheetProcessor', mockedCoversheetProcessor);
		$provide.value('CodeSheetProcessor', mockedCodesheetProcessor);
		$provide.value('RegisterProcessor', mockedRegisterProcessor);
		$provide.value('appLoadingFailed', false);

		inject(function(_$controller_, $rootScope, PageTypes) {
			_$rootScope = $rootScope;
			defer = $q.defer();
			scope = _$rootScope.$new();
			$controller = _$controller_;
			pageTypes = PageTypes;
		});

		$controller('TallySheetsController', {$scope: scope});
	});
	describe("On templates removed", function(){
		it("should broadcast the event down", function(){
			scope.templates = [];
			spy = jasmine.createSpy('templatesSelectionChangeHandlerSpy');
			scope.$on('templatesSelectionChanged', spy);
      scope.onTemplateSelectionChanged([], 'remove', 0);
      scope.$apply();
      expect(spy).toHaveBeenCalledWith(jasmine.any(Object), [], 'remove', 0);
		})
	});
  describe("On templates add", function(){
    it("should broadcast the event down", function(){
      scope.templates = [];
      spy = jasmine.createSpy('templatesSelectionChangeHandlerSpy');
      scope.$on('templatesSelectionChanged', spy);
      scope.onTemplateSelectionChanged([], 'add', 0);
      scope.$apply();
      expect(spy).toHaveBeenCalledWith(jasmine.any(Object), [], 'add', 0);
    })
  });
	describe("render templates", function() {

    describe("when dataset is selected", function() {
      it("should render dataset", function() {
        var template = { type: 'DataSet', data: { id: '143' }, displayName: "tally_ds1" };
        scope.selectedTemplatesType = 'DATASET';
        scope.renderTemplates([ template ]);
        scope.$apply();
        expect(scope.spinnerShown).toEqual(false);
        expect(scope.pages).toEqual(expectedPages);
      });
      describe("when program is selected", function() {
      	var template;
      	beforeEach(function(){
          template = { type: 'PROGRAM', data: { id: '143' }, displayName: "perpt_ds1" };
          scope.selectedTemplatesType = 'PROGRAM';
				});
        it("should render coversheet", function() {
          scope.programMode = pageTypes.COVERSHEET;
          scope.renderTemplates([ template ]);
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual("coversheet");
        });
        it("should render codesheet", function() {
          scope.programMode = pageTypes.CODESHEET;
          scope.renderTemplates([ template ]);
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual("codesheet");
        });
        it("should render register", function() {
          scope.programMode = pageTypes.REGISTER;
          scope.renderTemplates([ template ]);
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual("register");
        });

      });

      it("should not render the template which is neither program nor dataset", function() {
        scope.selectedTemplatesType = "testType";
        scope.renderTemplates([ { id: 'blah', data: {}, displayName: "perPt_prog1" } ]);
        scope.$apply();
        expect(scope.spinnerShown).toEqual(false);
        expect(scope.pages).toEqual([]);
      });
    });
  });
});