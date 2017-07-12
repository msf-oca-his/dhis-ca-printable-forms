describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer, $q, $provide;
	var _$rootScope;
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

		expectedPages = "testPages";

		mockedDataSetService = {
			getReferentialDataSetById: function() {
				return $q.when(mockDataset);
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
	})
});