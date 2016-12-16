describe("Common Utils", function() {
	var commonUtils;
	var config;
	beforeEach(function() {
		module("TallySheets");
		config = {
			Delimiters: {
				optionLabelDelimiter: "]"
			}
		};
		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function(CommonUtils) {
			commonUtils = CommonUtils;
		});
	});

	describe("getRightPartOfSplit", function() {
		it("should Split a string based on the delimiter provided and take only the second part of it", function() {
			var String = "[123]TestName";
			var actualLabel = commonUtils.getRightPartOfSplit(String, config.Delimiters.optionLabelDelimiter);
			expect(actualLabel).toEqual("TestName");
		});

		it("should split the label at the first delimiter only", function() {
			var String = "[123]Label] Label";
			var actualLabel = commonUtils.getRightPartOfSplit(String, config.Delimiters.optionLabelDelimiter);
			expect(actualLabel).toEqual("Label] Label");
		});

		it("should not trim whitespaces", function() {
			var String = "[123] Label Label";
			var actualLabel = commonUtils.getRightPartOfSplit(String, config.Delimiters.optionLabelDelimiter);
			expect(actualLabel).toEqual(" Label Label");
		});
	});
});