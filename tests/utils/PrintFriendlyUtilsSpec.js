describe("Print Friendly Utils", function() {
	var printFriendlyUtils;
	var config;
	beforeEach(function() {
		module("TallySheets");
		config = {
			DataSet: {
				numberOfCOCColumns: 5
			},
			OptionSet: {
				numberOfColumns: 3
			},
			customAttributes: {
				displayOptionUID: {
					options: {
						none: '0'
					}
				}
			},
			Delimiters: {
				categoryOptionComboDelimiter: "<br>"
			}
		};
		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function(PrintFriendlyUtils) {
			printFriendlyUtils = PrintFriendlyUtils;
		});
	});

	describe("createNewSectionUsing", function() {
		it("should assign dataElements passed to the specified key", function() {
			var actualSection = printFriendlyUtils.createNewSectionUsing({}, "testDataElements", "testKey");
			expect(actualSection.testKey).toEqual("testDataElements")
		});

		it("should not modify given section", function() {
			var testSection = {};
			printFriendlyUtils.createNewSectionUsing(testSection, "testDataElements", "testKey");
			expect(testSection).toEqual({})
		});

		it("should return a section with all the properties intact from the section passed", function() {
			var testSection = {testKey1: 'testValue1', testKey2: 'testValue2', testDataElements: 'testDEs'};
			var actualSection = printFriendlyUtils.createNewSectionUsing(testSection, "testDataElements", "testDataElements");
			expect(actualSection.testKey1).toEqual('testValue1');
			expect(actualSection.testKey2).toEqual('testValue2');
			expect(Object.keys(actualSection).length).toBe(Object.keys(testSection).length);
		});
	});

	describe("divideOptionSetsIntoNewSections", function() {
		var testSections;
		var stubbedPrintFriendlyUtils, optionSetDataElement, testTypeDataElement;
		beforeEach(function() {
			testSections = [
				{
					testKey: [
						{
							valueType: 'OPTIONSET',
							options: []
						}
					]
				}
			];
			inject(function(PrintFriendlyUtils) {
				testTypeDataElement = {valueType: 'testType'};
				stubbedPrintFriendlyUtils = PrintFriendlyUtils;
			})
		});
		it("should not divide section if there are no optionSet elements", function() {
			testSections[0].testKey[0].valueType = "testType";
			testSections[0].testKey[1] = testSections[0].testKey[0];
			printFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey")
			expect(testSections.length).toBe(1)
		});
		it("should create a new section when it encounters a optionSet type of dataElement", function() {
			testSections[0].testKey[0].valueType = "testType";
			testSections[0].testKey[1] = clone(testSections[0].testKey[0]);
			testSections[0].testKey[1].valueType = 'OPTIONSET';
			stubbedPrintFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey");
			expect(testSections.length).toBe(2);
			expect(testSections[1].testKey[0].valueType).toEqual('OPTIONSET');
			expect(testSections[1].testKey[0].options).toEqual([]);
			expect(testSections[1].testKey.length).toEqual(1);
		});

		it("should create new sections for each data element when the section has dataElements each of OptionSet Type", function() {
			testSections[0].testKey[0].valueType = "OPTIONSET";
			testSections[0].testKey[1] = clone(testSections[0].testKey[0]);
			testSections[0].testKey[2] = clone(testSections[0].testKey[0]);
			stubbedPrintFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey");
			expect(testSections.length).toBe(3);
			expect(testSections[0].testKey[0].valueType).toBe('OPTIONSET');
			expect(testSections[1].testKey[0].valueType).toBe('OPTIONSET');
			expect(testSections[2].testKey[0].valueType).toBe('OPTIONSET');
			expect(testSections[0].testKey.length).toBe(1);
			expect(testSections[0].testKey.length).toBe(1);
			expect(testSections[0].testKey[0].options).toEqual([]);
		});

		it("should create new sections for each data element of option set type and a collective section of another type", function() {
			testSections[0].testKey[0].valueType = "OPTIONSET";
			testSections[0].testKey[1] = clone(testSections[0].testKey[0]);
			testSections[0].testKey[2] = testTypeDataElement;
			testSections[0].testKey[3] = testTypeDataElement;
			stubbedPrintFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey");
			expect(testSections.length).toBe(3);
			expect(testSections[0].testKey[0].valueType).toBe('OPTIONSET');
			expect(testSections[1].testKey[0].valueType).toBe('OPTIONSET');
			expect(testSections[0].testKey[0].options).toEqual([]);
			expect(testSections[1].testKey[0].options).toEqual([]);
			expect(testSections[2].testKey[0].valueType).toEqual('testType');
			expect(testSections[2].testKey[1].valueType).toEqual('testType');
		});

	});

	describe("divideCatCombsIfNecessary", function() {
		var testSections;
		beforeEach(function() {
			config.DataSet.numberOfCOCColumns = 5;

			testSections = [{
				categoryCombo: {categoryOptionCombos: []},
				isCatComb: true,
				dataElements:[{
					greyedFieldIndexes:[7,8]
				}]
			}
			];
		});

		it("should not create new sections if the number of columns is equal to number of columns that can fit on the page", function() {
			testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5]
			var expectedSections = clone(testSections);
			printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0);
			expect(expectedSections.length).toEqual(testSections.length);
			expect(expectedSections).toEqual(testSections);
		});

		it("should not create new sections if the number of columns is less than the number of columns that can fit on the page", function() {
			testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3];
			var expectedSections = clone(testSections);
			printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0);
			expect(expectedSections.length).toEqual(testSections.length);
			expect(expectedSections).toEqual(testSections);
		});

		describe("when number of columns overflow", function() {
			it("should create new sections", function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections.length).toEqual(2);
			});

			it("should create new section with only overflown categoryOptionCombinations", function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].categoryCombo.categoryOptionCombos).toEqual([6, 7]);
			});

			it("should remove overflowing categoryOptionCombinations", function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
			});

			it("should create a duplicate section to accommodate overflown categoryOptionCombos", function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].categoryCombo.categoryOptionCombos).toEqual([6, 7]);
			});

			it("should not create a section with a single categoryOptionCombo", function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].categoryCombo.categoryOptionCombos).toEqual([5, 6]);
			});

			it("should create new sections only after the given index", function() {
				testSections[1] = clone(testSections[0]);
				testSections[2] = clone(testSections[0]);
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4];
				testSections[1].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				testSections[2].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 1, "testKey");
				expect(testSections[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4]);
				expect(testSections[1].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
				expect(testSections[2].categoryCombo.categoryOptionCombos).toEqual([6, 7]);
				expect(testSections[3].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
			});

			it("should substract number columns that can fit from the grey indexes array when columns got overflowed",function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7,8];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].dataElements[0].greyedFieldIndexes).toEqual([2,3]);
			});

			it("should be same grey indexes array when columns not overflowed",function() {
				testSections[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[0].dataElements[0].greyedFieldIndexes).toEqual([7,8]);
			})

		});

	});

	xdescribe("applyDisplayOptionsToDataElements", function() {
		var testSections;
		beforeEach(function() {
			testSections = [{
				testKey: []
			}];
		});

		it("should not apply displayOptions if the data element is not of optionSet type", function() {
			testSections[0].testKey[0].valueType = "testType";
			printFriendlyUtils.applyDisplayOptionsToDataElements(testSections[0], "testKey");
			expect(testSections[0].testKey[0].displayOption).toBe(false);
		});

	});
});
