describe("addPrefix Filter", function() {
	var addPrefix;
	var config;
	var scope;
	beforeEach(function() {
		module("TallySheets");
		angular.module("d2HeaderBar", [])
		inject(function(_$filter_, $sce) {
			addPrefix = _$filter_('addPrefix');
		});
		scope = {dataSetPrefix: 'testDSPrefix_', programPrefix: 'testProgramPrefix_'};
	});

	describe("when template is dataset", function() {
		it("should prefix template with dataset prefix", function() {
			var dataSet = {displayName: 'testDataSet', constructor: {name: 'DataSet'}};
			expect(addPrefix(dataSet, scope)).toBe("testDSPrefix_testDataSet")
		})
	});

	describe("when template is program", function() {
		it("should prefix template with program prefix", function() {
			var program = {displayName: 'testProgram', constructor: {name: 'Program'}};
			expect(addPrefix(program,scope)).toBe("testProgramPrefix_testProgram")
		})
	})

});