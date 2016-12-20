describe("CodeSheet Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var columns, codeSheetElements;

	function createElement() {
		element = angular.element('<code-sheet columns="pageColumns" program-name="programName"></code-sheet>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		config = {
			PageTypes: {
				A4: {
					Portrait: {
						availableHeight: 50,
						availableWidth: 183,
						graceHeight: 10
					}
				}
			},
			Metrics: {
				mm: "mm"
			},
			CodeSheet: {
				heightOfProgramTitle: 10,
				rowHeight: 6,
				numberOfColumns: 3
			}
		};
		module(function($provide,$translateProvider) {
			$provide.value('Config', config);
			$translateProvider.translations('en', {
				"codes": "Codes"
			});
			$translateProvider.use('en');
		});

		inject(function($compile, $rootScope) {
			$scope = $rootScope.$new();
			compile = $compile;
		});

		$scope.programName = "programName";
		$scope.pageColumns = [[
			{code: "Code", label: "dataElement", type: "HEADING"},
			{code: 1, label: "option1", type: "LABEL"},
			{code: 2, label: "option1", type: "LABEL"},
			{code: 3, label: "option1", type: "LABEL"},
			{code: "", label: "", type: "GAP"}], null, null];
		createElement();
	});

	it("should display the name of program", function() {
		$scope.$digest();
		expect(element.innerHTML).toContain($scope.programName + " - Codes")
	});

	it("should apply row height to each row in the table", function() {
		$scope.$digest();
		expect(element.querySelectorAll(".codeSheetCode")[0].style.height).toEqual(config.CodeSheet.rowHeight + "mm")
	});

	it("should display the codeSheet element codes", function() {
		createElement();
		$scope.$digest();
		codeSheetElements = element.querySelectorAll(".codeSheetCode");
		expect($scope.pageColumns[0].length).toBe(5);
		_.map(codeSheetElements, function(codeSheetElement, index) {
			if($scope.pageColumns[0][index].type == 'LABEL')
				expect(parseInt(_.trim(codeSheetElement.innerText))).toEqual($scope.pageColumns[0][index].code);
			else
				expect(_.trim(codeSheetElement.innerText)).toEqual($scope.pageColumns[0][index].code);
		});
	});

	it("should display the codeSheet element labels", function() {
		createElement();
		$scope.$digest();
		codeSheetElements = element.querySelectorAll('codeSheetLabel');
		expect($scope.pageColumns[0].length).toBe(5);
		_.map(codeSheetElements, function(codeSheetElement, index) {
			expect(_.trim(codeSheetElement.innerText)).toEqual($scope.pageColumns[0][index].label);
		});
	});

	describe("get class", function() {
		it("should give optionHeading if codeSheetElement type is HEADING", function() {
			var codeSheetElement = {type: 'HEADING'};
			$scope.$digest();
			expect(elementScope.getClass(codeSheetElement)).toEqual('optionHeading');
		});

		it("should give optionLabel if codeSheetElement type is LABEL", function() {
			var codeSheetElement = {type: 'LABEL'};
			$scope.$digest();
			expect(elementScope.getClass(codeSheetElement)).toEqual('optionLabel');
		});

		it("should give optionGap if codeSheetElement type is GAP", function() {
			var codeSheetElement = {type: 'GAP'};
			$scope.$digest();
			expect(elementScope.getClass(codeSheetElement)).toEqual('optionGap');
		});
	});
});