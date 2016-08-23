describe("Register Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var httpMock;
	var dataElements;

	function createElement() {
		element = angular.element('<template-register contents="modelContents" program-name="programName"></template-register>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		config = {
			Register: {
				availableHeight: 100,
				availableWidth: 270,
				labelHeight: 10,                 //table header
				tableHeaderHeight: 10,           //page header
				dataEntryRowHeight: 20,
				headerHeight: 10,
				textElementWidth: 50,
				otherElementWidth: 30
			},
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

		$scope.programName = "programName";
		dataElements = [{
			id: "1234",
			isResolved: Promise.resolve({}),
			name: "dataElement",
			type: "TEXT"
		}];
		$scope.modelContents = dataElements;
		createElement()
	});


	it("should display the name of program", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.programName)
	});

	xit("should apply table Header height to data element names", function() {
		// we should write this after doing JSS
	});

	it("should display the data element names", function() {
		$scope.modelContents = [
			{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement1",
				type: "TEXT",
			},
			{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement2",
				type: "TEXT",
			},
			{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement3",
				type: "TEXT",
			}
		];
		createElement();
		$scope.$digest();
		dataElements = element.querySelectorAll(".deLabel");
		expect(dataElements.length).toBe(3);
		_.map(dataElements, function(dataElement, index) {
			expect(_.trim(dataElement.innerText)).toEqual($scope.modelContents[index].name)
		})
	});

	it("should apply row height to data entry rows", function() {
		$scope.$digest();
		expect(element.querySelectorAll(".sno-value")[0].style.height).toEqual(config.Register.dataEntryRowHeight + "mm")
	});

	describe("get class", function() {
		it("should give de field text type if dataelement type is TEXT", function() {
			var dataElement = { valueType: 'TEXT' };
			$scope.$digest();
			expect(elementScope.getClass(dataElement)).toEqual('deField text');
		});

		it("should give de general text type if dataelement type is not TEXT", function() {
			var dataElement = { valueType: 'anything' };
			$scope.$digest();
			expect(elementScope.getClass(dataElement)).toEqual('deField general');
		});
	});

		it("should be able to identify number of rows it can hold", function() {
			config.Register.availableHeight =  100;
			config.Register.headerHeight = 10;
			config.Register.labelHeight = 10;
			config.Register.dataEntryRowHeight = 20;
			$scope.programName = "programName";
			$scope.modelContents = [];
			createElement();
			$scope.$digest();
			expect(elementScope.rows.length).toBe(4);
		})
});