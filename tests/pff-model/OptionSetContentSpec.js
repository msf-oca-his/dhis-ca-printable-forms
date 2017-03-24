describe("OptionSetContent", function() {
	var testSection;
	var OptionSetContent;
	var config;
	beforeEach(function() {
		config = {
			PageTypes: {
				A4: {
					Portrait: {
						availableHeight: 237,
						availableWidth: 183
					}
				}
			},
			Coversheet: {
				defaultHeightOfDataElementLabel: 9,
				gapBetweenSections: 5,
				heightOfSectionTitle: 7,
				heightOfProgramTitle: 10,
				commentsHeight: 30
			},
			OptionSet: {
				labelPadding: 4,
				dataElementLabel: 48,
				optionsPadding: 12,
				numberOfColumns: 3
			},
			Delimiters: {
				optionLabelEndDelimiter: "]"
			},
			CustomAttributes: {
				displayOptionUID: {
					id: "111",
					options: {
						none: '0',
						text: '1',
						list: '2'
					}
				}
			}
		};
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
		});
		inject(function(_OptionSetContent_) {
			OptionSetContent = _OptionSetContent_;
		});
		testSection = {
			displayName: "OptionSetContent",
			testKey: [
				{
					options: []
				}
			]

		};
	});
	it("should add empty array as rows when there are no options", function() {
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.rows).toEqual([]);
	});

	it("should have section title", function() {
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.title).toEqual("OptionSetContent");
	});

	it("should place a max of 3 options in each row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push({displayName: i + ""});
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.rows.length).toEqual(33);
		expect(actualSection.rows[32].length).toEqual(2);
	});

	it("should make sure that no option is left unassigned to its relevant row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push({displayName: i + ""});
		var actualSection = new OptionSetContent(testSection, "testKey");
		var val = Math.floor(98 / 3) + 1;
		for(var i = 0; i < 98; i++) {
			expect((actualSection.rows[Math.floor(i / 3)])[i % 3].label).toEqual((val * (i % 3) + Math.floor(i / 3)) + "");
		}
	});

	it("should split code and label of the displayName of options", function() {
		testSection.testKey[0].options.push({displayName: "[AB] MyOption"});
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.rows[0][0].label).toEqual("MyOption");
	});

	it("should trim the option label after splitting to eliminate white spaces", function() {
		testSection.testKey[0].options.push({displayName: "[AB]      MyOption"});
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.rows[0][0].label).toEqual("MyOption");
	});
});
