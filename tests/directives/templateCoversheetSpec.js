//#TODO: add more specs
describe("Coversheet Template", function() {
	var compile, element;
	var section;
	var $scope = {}, elementScope;
	var config = {};
	var httpMock;

	function createElement() {
		element = angular.element('<template-coversheet contents="modelContents" program-name="programName"></template-coversheet>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

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
				type: "TEXT"
			}],
			id: "134",
			isResolved: Promise.resolve({}),
			name: "section"
		};

		$scope.programName = "programName"
		$scope.modelContents = [];
		createElement()
	});

	it("should display the name of the program", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.programName)
	});




});