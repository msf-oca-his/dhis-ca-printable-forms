describe("CatComb", function() {
	var section;
	var compile;
	var $scope = {};
	var config = {
		DataSet: {
			widthOfCategoryOptionCombo: 3,
			widthOfDataElement: 4,
			availableWidthForDefaultSection: 9.5
		},
		CustomAttributes: {
			displayOptionUID: {
				options: "testDisplayOptions"
			}
		}
	};
	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function($compile, $rootScope) {
		$scope = $rootScope.$new();
		compile = $compile;
		section = {dataElements: [{categoryCombo: {}}]}
	}));
	//TODO: write tests here.
	xit("should get displayOptions from config", function() {
		var element = angular.element('<dataset-template contents = "" dataset-name = "test_DataSet"></dataset-template>');
		$scope.test_DataSet = "dataSetName";
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.displayOptions).toEqual(config.customAttributes.displayOptionUID.options)
	});

	xit("should return table width as 9.5cm when section is not catcomb", function() {
		var element = angular.element('<dataset-template contents="" dataset-name="test_DataSet"></dataset-template>');
		$scope.test_DataSet = "dataSetName";
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.getTableWidth(section)).toEqual("9.5cm");
	});

	xit("should return calculated table width when section is catcomb", function() {
		var currentSection = _.cloneDeep(section);
		currentSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"]
		currentSection.isCatComb = true;
		var element = angular.element('<dataset-template contents="modelContents" dataset-name="test_DataSet"></dataset-template>');
		$scope.test_DataSet = "dataSetName";
		$scope.modelContents = [];
		element = compile(element)($scope);
		$scope.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.getTableWidth(currentSection)).toEqual("10cm");
	});

});