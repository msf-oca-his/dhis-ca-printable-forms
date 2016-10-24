describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer, $q, $provide;
	var _$rootScope;
	var dataSetService;
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
		inject(function(_$q_){
			$q = _$q_;
		});
		var mockDataset = "testDataSet";
		var mockProgram = "testProgram";

		expectedPages = "testPages";

		mockedDataSetService = {
			getReferentialDataSet: function() {
				return $q.when(mockDataset);
			}
		};
		mockedProgramService = {
			getProgram: function() {
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
		$provide.value('CustomAttributeValidationService',mockedValidationService);
		$provide.value('CoversheetProcessor', mockedProgramProcessor);
		$provide.value('CodeSheetProcessor', mockedProgramProcessor);
		$provide.value('RegisterProcessor', mockedProgramProcessor);
		$provide.value('appLoadingFailed', false);
	});

	beforeEach(inject(function(_$controller_, $rootScope, DataSetService) {
		_$rootScope = $rootScope;
		defer = $q.defer();
		dataSetService = DataSetService;
		scope = _$rootScope.$new();
		$controller = _$controller_;
	}));

	beforeEach(function() {
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
			var template = {id: '134'};
			scope.templates = [template];
			scope.selectedTemplatesType = 'DATASET';
			scope.renderTemplates();
			scope.$apply();
			expect(scope.spinnerShown).toEqual(false);
			expect(scope.pages).toEqual(expectedPages);
		});

		it("should render the programs if it has template id", function() {
			scope.templates = [{id:'blah'}]
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
	})
});