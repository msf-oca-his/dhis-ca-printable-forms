describe("Register Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {
		Coversheet: {
			maximumCharLengthForHeader: 10
		}
	};
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


		inject(function($compile, $rootScope) {
			$scope = $rootScope.$new().$new().$new();
			compile = $compile;
		});

		$scope.programName = "programName";
		$scope.$parent.$parent.page = {type:'REGISTER'};
		$scope.header = "health_structure";
		$scope.modelContents = dataElements;
		createElement()
	});

	it("should display the name of program and codes as static text", function() {
		$scope.$digest();
		var element1 = compile('<linelist-header programName="testProgram1"></linelist-header>')($scope);
		$scope.$apply();
		expect(element1[0].outerHTML).toContain("testProgram1")
	});

	it("should display the header", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.header)
	});
});