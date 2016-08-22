describe("Program controller", function() {
	var compile;
	var section;
	var $scopeCtrl = {};
	var config = {};
	var httpMock;
	beforeEach(function() {
		module("TallySheets");
		config = {
			Register: {
				availableHeight: 100,
				availableWidth: 270,
				labelHeight: 10,            //table header
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
	});

	beforeEach(inject(function($compile, $rootScope, $httpBackend) {
		$scopeCtrl = $rootScope.$new();
		compile = $compile;
		httpMock = $httpBackend;
		httpMock.expectGET("i18n/en.json").respond(200, {});

	}));

	beforeEach(function() {
		section = {
			dataElements: [{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement",
				type: "TEXT",
				categoryCombo: {}
			}],
			id: "134",
			isResolved: Promise.resolve({}),
			name: "section"
		};
	});

	it("should get displayOptions from config", function() {
		var element = angular.element('<template-coversheet contents="" program-name="test_program"></template-coversheet>');
		$scopeCtrl.test_program = "programName"
		$scopeCtrl.modelContents = [];
		element = compile(element)($scopeCtrl);
		$scopeCtrl.$digest();
		elementsScope = element.scope().$$childHead;
		expect(elementsScope.displayOptions).toEqual(config.DisplayOptions)
	});

	describe("get class", function() {
		it("should give de field text type if dataelement type is TEXT", function() {
			var dataElement = {valueType: 'TEXT'};
			var element = angular.element('<template-register contents="modelContents" program-name="test_program" rows="rows"></template-register>');
			$scopeCtrl.test_program = "programName";
			$scopeCtrl.modelContents = [];
			$scopeCtrl.rows = [];
			element = compile(element)($scopeCtrl);
			$scopeCtrl.$digest();
			elementsScope = element.scope().$$childHead;
			expect(elementsScope.getClass(dataElement)).toEqual('deField text');
		});

		it("should give de general text type if dataelement type is not TEXT", function() {
			var dataElement = {valueType: 'CatComb'};
			var element = angular.element('<template-register contents="modelContents" program-name="test_program" rows="rows"></template-register>');
			$scopeCtrl.test_program = "programName";
			$scopeCtrl.modelContents = [];
			$scopeCtrl.rows = [];
			element = compile(element)($scopeCtrl);
			$scopeCtrl.$digest();
			elementsScope = element.scope().$$childHead;
			expect(elementsScope.getClass(dataElement)).toEqual('deField general');
		});

		it("finding number rows for scope variable", function() {
			var element = angular.element('<template-register contents="modelContents" program-name="test_program" rows="rows"></template-register>');
			$scopeCtrl.test_program = "programName";
			$scopeCtrl.modelContents = [];
			$scopeCtrl.rows = [];
			element = compile(element)($scopeCtrl);
			$scopeCtrl.$digest();
			elementsScope = element.scope().$$childHead;
			expect(elementsScope.rows.length).toBe(4);
		})

	});

});