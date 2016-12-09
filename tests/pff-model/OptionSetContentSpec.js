describe("OptionSetContent", function() {
	var testSection;
	var OptionSetContent;
	var config;
	beforeEach(function() {
		config = {
			PageTypes       : {
				A4: {
					Portrait: {
						availableHeight: 237,
						availableWidth : 183,
						graceHeight    : 10
					}
				}
			},
			Coversheet      : {
				heightOfTableHeader              : 15,
				heightOfDataElementInCatCombTable: 12,
				defaultHeightOfDataElementLabel  : 9,
				heightOfSectionTitle             : 7,
				heightOfProgramTitle             : 10,
				gapBetweenSections               : 5,
				graceHeight                      : 10,
				availableHeight                  : 237,
				availableWidth                   : 183,
				numberOfCOCColumns               : 5,
				commentsHeight                   : 30
			},
			OptionSet       : {
				labelPadding    : 4,
				dataElementLabel: 48,
				optionsPadding  : 12,
				numberOfColumns : 3
			},
			Delimiters      : {
				optionLabelDelimiter: "]"
			},
			CustomAttributes: {
				displayOptionUID: {
					id     : "111",
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

	it("should place a max of 3 options in each row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push(i)
		var actualSection = new OptionSetContent(testSection, "testKey");
		expect(actualSection.rows.length).toEqual(33);
		expect(actualSection.rows[32].length).toEqual(2);
	});

	it("should make sure that no option is left unassigned to its relevant row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push(i)
		var actualSection = new OptionSetContent(testSection, "testKey");
		var val = Math.floor(98 / 3) + 1;
		for(var i = 0; i < 98; i++) {
			expect((actualSection.rows[Math.floor(i / 3)])[i % 3]).toBe(val * (i % 3) + Math.floor(i / 3));
		}
	});
});
