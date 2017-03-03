describe("DataSet Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var dataElements;

	function createElement() {

		element = angular.element('<dataset-template contents="modelContents" dataset-name="datasetName"></dataset-template>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		config = {
			customAttributes: {
				displayOptionUID: {
					id: "1234",
					associatedWith: ['dataElement'],
					options: {
						none: '0',
						text: '1',
						list: '2'
					}
				}
			}
		};

		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function($compile, $rootScope) {
			$scope = $rootScope.$new();
			compile = $compile;
		});

		$scope.header = "health_structure";
		$scope.supervisor = "supervisor";
		$scope.startOrEndDate = "start_or_end_date";
		$scope.modelContents = dataElements;
		createElement()
	});

	it("should display the header label", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.header)
	});

	it("should display the supervisor label", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.supervisor)
	});

	it("should display the start or end date label", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.startOrEndDate)
	});
});