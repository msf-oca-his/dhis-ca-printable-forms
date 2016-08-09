describe("Dataset ctrl", function() {
	var $controller;
	var section;
	var datasetCtrl;
	var $scope = {};
	var config = {DisplayOptions: "testDisplayOptions"}
	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function(_$controller_) {
		$controller = _$controller_;
		datasetCtrl = $controller('datasetCtrl', {$scope: $scope});
		section = {dataElements: [{categoryCombo: {}}]}
	}));

	it("should get displayOptions from config", function() {
		expect($scope.displayOptions).toEqual(config.DisplayOptions)
	});

	it("should return table width as 9.5cm when section is not catcomb", function() {
		expect($scope.getTableWidth(section)).toEqual("9.5cm");
	});

	it("should return calculated table width when section is catcomb", function() {
		var currentSection = _.cloneDeep(section);
		currentSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"]
		currentSection.isCatComb = true;
		expect($scope.getTableWidth(currentSection)).toEqual("10cm");
	});

});