describe("defaultContentSpec", function() {
	var compile;
	var $scope = {};
	var config = {
		DataSet: {
			widthOfCategoryOptionCombo: 3,
			widthOfDataElement: 4,
			availableWidthForDefaultSection: 9.5
		},
		PageTypes :{
		A4: {
			Portrait: {
				availableWidth: 183
			}
		}
	},
	Metrics :{
		mm: "mm"
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
	}));
	
	it("should render type when only one dataelement present", function() {
		var element = angular.element('<default-content content="test_contents"></default-content>');
		$scope.test_contents = {leftSideDataElements:[{valueType:'BOOLEAN'}]};
		element = compile(element)($scope);
		$scope.$digest();
		expect(element[0].getElementsByClassName('left-row')[0].children[0].tagName).toEqual('BOOLEAN');
	});
	
	it("should render boolean as boolean type and text as default type when only two dataelements present", function(){
		var element = angular.element('<default-content content="test_contents"></default-content>');
		$scope.test_contents = {leftSideDataElements:[{valueType:'BOOLEAN'}],rightSideDataElements:[{valueType:'TEXT'}]};
		element = compile(element)($scope);
		$scope.$digest();
		expect(element[0].getElementsByClassName('left-row')[0].children[0].tagName).toEqual('BOOLEAN');
		expect(element[0].getElementsByClassName('right-row')[0].children[0].tagName).toEqual('DEFAULT-TYPE')
	});
	it("should render all the default content types when more than two dataelements present",function() {
		var element = angular.element('<default-content content="test_contents"></default-content>');
		$scope.test_contents = {leftSideDataElements:[{valueType:'NUMBER'},{valueType:'LONG_TEXT'}],rightSideDataElements:[{valueType:'TRUE_ONLY'},{valueType:'TEXT'}]};
		element = compile(element)($scope);
		$scope.$digest();
		expect(element[0].getElementsByClassName('left-row')[0].children[0].tagName).toEqual('DEFAULT-TYPE');
		expect(element[0].getElementsByClassName('left-row')[1].children[0].tagName).toEqual('DEFAULT-TYPE');
		expect(element[0].getElementsByClassName('right-row')[0].children[0].tagName).toEqual('YES-ONLY');
		expect(element[0].getElementsByClassName('right-row')[1].children[0].tagName).toEqual('DEFAULT-TYPE')
	});

	
});