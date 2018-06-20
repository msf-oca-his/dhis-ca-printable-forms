describe("Register Content", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var dataElements;
	var pageConfigReader;

	function createElement() {
		element = angular.element('<register-content content="modelContents"></register-content>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		pageConfigReader = {
            getPageConfig: function () {
                return Promise.resolve({
                    "height": 297,
                    "width": 210,

                    "Delimiters": {
                        "categoryOptionComboDelimiter": "mm"
                    },

                    "components": {

                        "border": {
                            "top": 15,
                            "left": 15,
                            "bottom": 15,
                            "right": 15
                        }
                    }
                })
            }
        }
		config = {
			Register: {
				tableHeaderHeight: 10,
				dataEntryRowHeight: 20,
				pageHeaderHeight: 10,
				textElementWidth: 50,
				otherElementWidth: 30,
				defaultColumnWidth:30,
        widthOfSNOColumn: 10,
			},
			Metrics: {
				mm: "mm"
			},
			DisplayOptions: "testDisplayOptions"
		};
		module(function($provide) {
			$provide.value('Config', config);
			$provide.value('PageConfigReader',pageConfigReader)
		});

		inject(function($compile, $rootScope) {
			$scope = $rootScope.$new();
			compile = $compile;
		});

		$scope.programName = "programName";
		dataElements = [{
			id: "1234",
			name: "dataElement",
			type: "TEXT",
      renderType: {
        code: 10,
        width: 60
      }
		}];
		$scope.modelContents = dataElements;
		createElement()
	});

	it("should display the data element names", function() {
		$scope.modelContents = [
			{
				id: "1234",
				name: "dataElement1",
				displayName: "dataElement1",
				type: "TEXT"
			},
			{
				id: "1234",
				name: "dataElement2",
				displayName: "dataElement2",
				type: "TEXT",
			},
			{
				id: "1234",
				name: "dataElement3",
				displayName: "dataElement3",
				type: "TEXT"
			}
		];
		createElement();
		$scope.$digest();
		dataElements = element.querySelectorAll(".deLabel");
		expect(dataElements.length).toBe(3);
		_.map(dataElements, function(dataElement, index) {
			expect(_.trim(dataElement.innerText)).toEqual($scope.modelContents[index].displayName)
		})
	});

	it("should apply row height to data entry rows", function() {
		$scope.$digest();
		Promise.resolve().then(function () {
            expect(element.querySelectorAll(".sno-value")[0].style.height).toEqual(config.Register.dataEntryRowHeight + "mm")
		});

	});

	it("should assign width of data elements", function() {
		dataElements[0].renderType.width = 100;
		createElement();
		$scope.$digest();
		expect(element.querySelector('.deLabel').style.width).toBe("99mm");
	});

	it("should be able to identify number of rows it can hold", function() {
		config.Register.pageHeaderHeight = 10;
		config.Register.tableHeaderHeight = 10;
		config.Register.dataEntryRowHeight = 20;
		$scope.programName = "programName";
		$scope.modelContents = [];
		createElement();
		$scope.$digest();
        Promise.resolve().then(function () {
            expect(elementScope.rows.length).toBe(4);
        })
	})
});