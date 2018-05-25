describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer, $q, $provide;
	var _$rootScope;
	var mockedTemplatesToJsTreeNodesService;
	var mockedDataSetService;
	var mockedDataSetProcessor;
	var mockedProgramService;
	var mockedCodesheetProcessor, mockedCoversheetProcessor, mockedRegisterProcessor, mockedTemplateCustomizationService;
	var expectedPages;
	var mockedValidationService;
	var mockDataset;
	var pageTypes;
	var mockedComponentProcessor;
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
				return {type: "dataset", templates: arguments[0]};
			}
		};

        mockedComponentProcessor = {
            processComponents: function() {
                if(_.isEmpty(arguments[0]))
                    return [];
                return {type: "dataset", templates: arguments[0]};
            }
        }

    mockedCoversheetProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return {type: "coversheet", templates: arguments[0]};
      }
    };
    mockedCodesheetProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return {type: "codesheet", templates: arguments[0]};
      }
    };
    mockedRegisterProcessor = {
      process: function() {
        if(_.isEmpty(arguments[0]))
          return [];
        return {type: "register", templates: arguments[0]};
      }
    };
    mockedTemplateCustomizationService ={
      customizeTemplates : function() {
        return ["customized templates"];
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
		$provide.value('ComponentProcessor',mockedComponentProcessor)
		$provide.value('TemplateCustomizationService', mockedTemplateCustomizationService);
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
      xit("should render dataset", function(done) {
        var template = { type: 'DataSet', data: { id: '143' }, displayName: "tally_ds1" };
        scope.selectedTemplatesType = 'DATASET';
        scope.renderTemplates([ template ]);
        setTimeout(function() {
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual({ templates: [ template ], type: 'dataset' });
          done();
        }, 100)

      });

      describe("and customized", function() {
        xit("should render customized dataset", function(done) {
          var template = { type: 'DataSet', data: { id: '143' }, displayName: "tally_ds1" };
          scope.programMode = pageTypes.DATASET;
          scope.selectedTemplatesType = 'DATASET';
          scope.templatesCustomizations = [ "blah", "blah" ];
          scope.renderTemplates([ template ]);
          setTimeout(function() {
            scope.$apply();
            expect(scope.spinnerShown).toEqual(false);
            expect(scope.pages).toEqual({ type: "dataset", templates: ["customized templates"] });
            done();
          }, 100)

        });
      });
    });
    describe("when program is selected", function() {
      var template;
      beforeEach(function(){
        template = { type: 'PROGRAM', data: {id: '143' }, displayName: "perpt_ds1" };
        scope.selectedTemplatesType = 'PROGRAM';
      });
      xit("should render coversheet", function(done) {
        scope.programMode = pageTypes.COVERSHEET;
        scope.renderTemplates([ template ]);
        setTimeout(function(){
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual({templates: template, type: 'coversheet'});
          done();
        }, 100)

      });

	    xit("should cache the program when the program gets selected", function(done) {
		    var template = { type: 'PROGRAM', id: '143', displayName: "perpt_ds1" };
		    scope.programMode = pageTypes.COVERSHEET;
		    scope.renderTemplates([template]);
		    setTimeout(function(){
			    scope.$apply();
			    expect(scope.cachedTemplates).toEqual([template]);
			    done();
		    }, 100)
	    });

	    xit("should not cache the program If it is already get selected", function(done) {
		    var template = { type: 'PROGRAM', id: '143', displayName: "perpt_ds1" };
		    scope.programMode = pageTypes.COVERSHEET;
		    scope.renderTemplates([template]);
		    setTimeout(function() {
			    scope.$apply();
			    scope.renderTemplates([template]);
			    setTimeout(function() {
				    scope.$apply();
				    expect(scope.cachedTemplates).toEqual([template]);
				    done();
			    },100)
		    },100)
	    });
	    
	    xit("should add the programs to cache when multiple new programs get selected",function(done) {
		    var template = { type: 'PROGRAM', id: '143', displayName: "perpt_ds1" };
		    scope.programMode = pageTypes.COVERSHEET;
		    scope.renderTemplates([template]);
		    setTimeout(function() {
			    scope.$apply();
			    var template1 = { type: 'PROGRAM', data: { id: '153' }, displayName: "perpt_ds2" };
			    scope.renderTemplates([template1]);
			    setTimeout(function() {
				    scope.$apply();
				    expect(scope.cachedTemplates).toEqual([template,template1]);
				    done();
			    },100)
		    },100)
	    });
	    
	    xit("should take display name from cached program if selected template already present in cached list", function(done) {
		    var template = { type: 'PROGRAM', id: '143', displayName: "perpt_ds1" };
		     scope.programMode = pageTypes.COVERSHEET;
		    scope.renderTemplates([template]);
		    setTimeout(function() {
			    scope.$apply();
			    scope.cachedTemplates[0].displayName = "changedDisplayName";
			    scope.renderTemplates([template]);
			    setTimeout(function() {
				    scope.$apply();
				    expectedPages = {type:'coversheet',templates:{type:'PROGRAM',id:'143',displayName:'changedDisplayName'}};
				    expect(scope.pages).toEqual(expectedPages);
				    done();
			    },100)
		    },100)
	    });
      
	    describe("and customized",function(){
        xit("should render customized coversheet", function(done) {
          scope.programMode = pageTypes.COVERSHEET;
          scope.renderTemplates([ template ]);
          scope.templatesCustomizations = ["blah", "blah"];
          setTimeout(function(){
            scope.$apply();
            expect(scope.spinnerShown).toEqual(false);
            expect(scope.pages).toEqual({type: "coversheet", templates: "customized templates"});
            done();
          }, 100)

        });
      });
      it("should render codesheet", function(done) {
        scope.programMode = pageTypes.CODESHEET;
        scope.renderTemplates([ template ]);
        setTimeout(function(){
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual({templates: template, type: 'codesheet'});
          done();
        }, 100)

      });
      describe("and customized",function(){
        it("should render customized codesheet", function(done) {
          scope.programMode = pageTypes.CODESHEET;
          scope.renderTemplates([ template ]);
          scope.templatesCustomizations = ["blah", "blah"];
          setTimeout(function(){
            scope.$apply();
            expect(scope.spinnerShown).toEqual(false);
            expect(scope.pages).toEqual({type: "codesheet", templates: "customized templates"});
            done();
          }, 100)

        });
      });
      it("should render register", function(done) {
        scope.programMode = pageTypes.REGISTER;
        scope.renderTemplates([ template ]);
        setTimeout(function(){
          scope.$apply();
          expect(scope.spinnerShown).toEqual(false);
          expect(scope.pages).toEqual({templates: template, type: 'register'});
          done();
        }, 100)
      });
      describe("and customized",function(){
        it("should render customized register", function(done) {
          scope.programMode = pageTypes.REGISTER;
          scope.renderTemplates([ template ]);
          scope.templatesCustomizations = ["blah", "blah"];
          setTimeout(function(){
            scope.$apply();
            expect(scope.spinnerShown).toEqual(false);
            expect(scope.pages).toEqual({type: "register", templates: "customized templates"});
            done();
          }, 100)

        });
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