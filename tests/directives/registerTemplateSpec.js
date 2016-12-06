describe("Register Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var httpMock;
	var dataElements;

	function createElement() {
		element = angular.element('<register-template contents="modelContents" program-name="programName"></register-template>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function($compile, $rootScope, $httpBackend) {
			$scope = $rootScope.$new();
			compile = $compile;
			httpMock = $httpBackend;
			httpMock.expectGET("i18n/en.json").respond(200, {});
		});

		$scope.programName = "programName";
		$scope.modelContents = dataElements;
		createElement()
	});

	it("should display the name of program", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.programName)
	});


});