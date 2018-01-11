describe("CodeSheet Template", function() {
	var compile, element;
	var $scope = {}, elementScope;
	var config = {};
	var rootScope;

	function createElement() {
		element = angular.element('<linelist-header program-name="programName"></linelist-header>');
		element = compile(element)($scope);
		elementScope = element.scope().$$childHead;
		element = element[0];
	}

	beforeEach(function() {
		module("TallySheets");
		config = {
			Coversheet: {
				maximumCharLengthForHeader: 10
			}
		};
		module(function($provide) {
			$provide.value('Config', config);

		});

		inject(function($compile, $rootScope) {
			rootScope = $rootScope;
			$scope = $rootScope.$new().$new().$new();
			compile = $compile;
		});

		rootScope.renderTemplates=function() {
			return [];
		};
		
		$scope.$parent.$parent.page = {type:'CODESHEET'};
		createElement();
	});

	it("should call update method when user tries to edit the header name", function() {
		spyOn(elementScope,'update');
		var input = element.querySelector('input');
		angular.element(input).triggerHandler('blur');
		elementScope.$apply();
		expect(elementScope.update).toHaveBeenCalled();
	});
	
	it("should take previous header name when user enters empty header name", function() {
		elementScope.programName="testProgram";
		var input = element.querySelector('input');
		elementScope.headerName="";
		elementScope.$apply();
		angular.element(input).triggerHandler('blur');
		expect(elementScope.headerName).toEqual("testProgram");
	});
	
	it("should save the edited header name",function() {
		rootScope.cachedProgramNames = [{displayName:'testProgram'}];
		spyOn(rootScope,'renderTemplates');
		elementScope.programName="testProgram";
		var input = element.querySelector('input');
		elementScope.headerName="changedProgram";
		angular.element(input).triggerHandler('blur');
		elementScope.$apply();
		expect(elementScope.programName).toEqual('changedProgram');
		expect(rootScope.cachedProgramNames[0]).toEqual({displayName:'changedProgram'});
	})
});