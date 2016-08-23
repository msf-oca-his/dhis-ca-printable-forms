//#TODO: add more specs
describe("Coversheet Template", function() {
	var compile, element;
	var section;
	var $scope = {};
	var config = {};
	var httpMock;
	beforeEach(function() {
		module("TallySheets");
		config = {
			DisplayOptions: "testDisplayOptions"
		};
		module(function($provide) {
			$provide.value('Config', config);
		});
		inject(function($compile, $rootScope, $httpBackend) {
			$scope = $rootScope.$new();
			compile = $compile;
			httpMock = $httpBackend;
			httpMock.expectGET("i18n/en.json").respond(200, {});

		});
		section = {
			dataElements: [{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement",
				type: "TEXT",
				categoryCombo: {}
			}],
			id: "134",
			isResolved: Promise.resolve({}),
			name: "section"
		};

		$scope.programName = "programName"
		$scope.modelContents = [];
		element = angular.element('<template-coversheet contents="modelContents" program-name="programName"></template-coversheet>');
		element = compile(element)($scope);
		$scope.$digest();
	});

	it("should get the program name", function() {
		expect(element[0].innerHTML).toContain($scope.programName)
	});

	it("should get displayOptions", function() {
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.displayOptions).toEqual(config.DisplayOptions)
	});

});