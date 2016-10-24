describe("TallySheets ctrl", function() {
	var $controller;
	var scope;
	var defer;
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

		var mockDataset = "testDataSet";
		var mockProgram = "testProgram";

		expectedPages = "testPages";

		mockedDataSetService = {
			getReferentialDataSet: function() {
				return Promise.resolve(mockDataset);
			}
		};
		mockedProgramService = {
			getProgram: function() {
				return Promise.resolve(mockProgram);
			}
		};
		mockedDataSetProcessor = {
			process: function() {
				return expectedPages;
			}
		};

		mockedProgramProcessor = {
			process: function() {
				return expectedPages;
			}
		};

		mockedValidationService = {
			validate: function() {
				return Promise.resolve({});
			}
		};

		module(function($provide) {
			$provide.value('OptionSetFactory', Promise.resolve({}));
			$provide.value('DataSetService', mockedDataSetService);
			$provide.value('DataSetProcessor', mockedDataSetProcessor);
			$provide.value('ProgramService', mockedProgramService);
			$provide.value('ProgramProcessor', mockedProgramProcessor);
			$provide.value('CustomAttributeValidationService',mockedValidationService);
			$provide.value('CoversheetProcessor', mockedProgramProcessor);
			$provide.value('RegisterProcessor', mockedProgramProcessor);
			$provide.value('CodeSheetProcessor', mockedProgramProcessor);
			$provide.value('appLoadingFailed', false);
		});
	});

	beforeEach(inject(function(_$controller_, $rootScope, $q, DataSetService) {
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
		it("should not render template if it doesn't have template id", function(done) {
			scope.template= {};
			scope.renderTemplates();
			Promise.resolve({})
				.then(function() {
					expect(scope.spinnerShown).toBe(false);
					expect(scope.pages).toEqual([]);
					done();
				});
		});

		it("should render the templates if it has template id", function(done) {
			scope.template.id = 123;
			scope.template.type = "DATASET";
			scope.renderTemplates();
			getPromiseOfDepth(4)
				.then(function() {
				expect(scope.spinnerShown).toEqual(false);
				expect(scope.pages).toEqual(expectedPages);
				done();
			});
			scope.$digest();
		});

		it("should render the programs if it has template id", function(done) {
			scope.template.id = 123;
			scope.template.type = "PROGRAM";
			scope.programMode = "COVERSHEET";
			_$rootScope.$apply();
			scope.renderTemplates();
			getPromiseOfDepth(4).then(function() {
				expect(scope.spinnerShown).toEqual(false);
				expect(scope.pages).toEqual(expectedPages);
				done();
			});
			scope.$digest();
		});

		it("should not render the template which is neither program nor dataset if it has template id", function(done) {
			scope.template.id = 123;
			scope.template.type = "";
			scope.renderTemplates();
			getPromiseOfDepth(2).then(function() {
					expect(scope.spinnerShown).toEqual(false);
					expect(scope.pages).toEqual([]);
					done();
				});
			scope.$digest();
		});
	})
});