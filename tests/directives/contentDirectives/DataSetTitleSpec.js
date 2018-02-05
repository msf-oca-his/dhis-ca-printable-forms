describe("Dataset title Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var rootScope;

	function createElement() {
		element = angular.element('<dataset-title content="testcontent"></dataset-title>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		config = {
			DataSet: {
				maximumCharLengthForHeader: 10
			}
		};
		module(function($provide) {
			$provide.value('Config', config);

		});

		inject(function($compile, $rootScope) {
			rootScope=$rootScope;
			$scope = $rootScope.$new();
			compile = $compile;
		});

		rootScope.renderTemplates=function() {
			return [];
		};

		// createElement();
	});

	it("should call update method when user tries to edit the header name", function() {
		element = angular.element('<dataset-title content="testcontent"></dataset-title>');
		$scope.testcontent = {title:"hello"};
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
		spyOn(elementScope,'update');
		var input = element.querySelector('input');
		angular.element(input).triggerHandler('blur');
		elementScope.$apply();
		expect(elementScope.update).toHaveBeenCalled();
	});

	it("should take previous header name when user enters empty header name", function() {
		element = angular.element('<dataset-title content="testcontent"></dataset-title>');
		$scope.testcontent = {title:"testdsname"};
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
		var input = element.querySelector('input');
		elementScope.headerName="";
		elementScope.$apply();
		angular.element(input).triggerHandler('blur');
		expect(elementScope.headerName).toEqual("testdsname");
	});

	it("should save the edited header name",function() {
		rootScope.cachedTemplates = [{displayName:'testdsname'}];
		element = angular.element('<dataset-title content="testcontent"></dataset-title>');
		$scope.testcontent = {title:"testdsname"};
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
		spyOn(rootScope,'renderTemplates');
		var input = element.querySelector('input');
		elementScope.headerName="changedds";
		angular.element(input).triggerHandler('blur');
		elementScope.$apply();
		expect(rootScope.cachedTemplates[0]).toEqual({displayName:'changedds'});
	})
});