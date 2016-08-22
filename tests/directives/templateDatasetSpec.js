describe("Dataset ctrl", function() {
	var section;
	var compile, httpMock;
	var $scope = {};
	var config = {DisplayOptions: "testDisplayOptions"}
	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function($compile, $rootScope, $httpBackend) {
		$scope = $rootScope.$new();
		compile = $compile;
		httpMock = $httpBackend;
		httpMock.expectGET("i18n/en.json").respond(200, {});
		section = {dataElements: [{categoryCombo: {}}]}
	}));

	it("should get displayOptions from config", function() {
		var element = angular.element('<template-dataset contents="" dataset-name="test_DataSet"></template-dataset>');
		$scope.test_DataSet = "dataSetName"
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.displayOptions).toEqual(config.DisplayOptions)
	});

	it("should return table width as 9.5cm when section is not catcomb", function() {
		var element = angular.element('<template-dataset contents="" dataset-name="test_DataSet"></template-dataset>');
		$scope.test_DataSet = "dataSetName"
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.getTableWidth(section)).toEqual("9.5cm");
	});

	it("should return calculated table width when section is catcomb", function() {
		var currentSection = _.cloneDeep(section);
		currentSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"]
		currentSection.isCatComb = true;
		var element = angular.element('<template-dataset contents="modelContents" dataset-name="test_DataSet"></template-dataset>');
		$scope.test_DataSet = "dataSetName"
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.getTableWidth(currentSection)).toEqual("10cm");
	});

});