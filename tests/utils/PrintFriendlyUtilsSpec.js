describe("Print Friendly Utils", function() {
	var printFriendlyUtils;
	var httpMock;
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
			CustomAttributes: {
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

		inject(function(PrintFriendlyUtils, $httpBackend) {
			printFriendlyUtils = PrintFriendlyUtils;
			httpMock = $httpBackend;
			httpMock.expectGET("i18n/en.json").respond(200, {});
		});
	});

	describe("createNewSectionUsing", function() {
		it("should add duplicate flag to the new section created", function() {
			var actualSection = printFriendlyUtils.createNewSectionUsing({}, "testDataElements", "testKey");
			expect(actualSection.isDuplicate).toBe(true)
		});

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
			var testSection = {testKey1: 'testValue1', testKey2: 'testValue2'};
			var actualSection = printFriendlyUtils.createNewSectionUsing(testSection, "testDataElements", "testKey");
			expect(actualSection.testKey1).toEqual('testValue1');
			expect(actualSection.testKey2).toEqual('testValue2');
			expect(Object.keys(actualSection).length).toBe(Object.keys(testSection).length + 2);
		});
	});

	describe("addLineBreakAfterEachCategoryOption", function() {
		var testSection;
		beforeEach(function() {
			testSection = {
				testKey: [{
					categoryCombo: {
						categoryOptionCombos: ["test,String1,", "test,String2,", "test, String3"]
					}
				}]
			};
		});
		it("should replace all , with <br>s", function() {
			printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
			expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
		});

		it("should replace , with <br>s in all categoryOptionCombos", function() {
			printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
			expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
			expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[1]).toEqual("test<br>String2<br>");
			expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[2]).toEqual("test<br> String3");
		});

		it("should not replace any other character", function() {
			var testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()./>?:;'|\]}[{')\",";
			testSection.testKey[0].categoryCombo.categoryOptionCombos.push(testString);
			printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
			expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[3]).toEqual(testString.replace(",", config.Delimiters.categoryOptionComboDelimiter));
		})
	});

	describe("createOptionSetSection", function() {
		var testSection;
		beforeEach(function() {
			testSection = {
				testKey: [
					{
						options: []
					}
				]
			};
		});
		it("should add empty array as rows when there are no options", function() {
			var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
			expect(actualSection.testKey[0].rows).toEqual([]);
		});

		it("should place a max of 3 options in each row", function() {
			for(var i = 0; i < 98; i++)
				testSection.testKey[0].options.push(i)
			var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
			expect(actualSection.testKey[0].rows.length).toEqual(33);
			expect(actualSection.testKey[0].rows[32].length).toEqual(2);
		});

		it("should make sure that no option is left unassigned to its relevant row", function() {
			for(var i = 0; i < 98; i++)
				testSection.testKey[0].options.push(i)
			var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
			var val = Math.floor(98 / config.OptionSet.numberOfColumns) + 1;
			for(var i = 0; i < 98; i++) {
				expect((actualSection.testKey[0].rows[Math.floor(i / 3)])[i % 3]).toBe(val * (i % 3) + Math.floor(i / 3));
			}
		});
		it("should add isOptionSet property to the section", function() {
			var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
			expect(actualSection.isOptionSet).toBe(true)
		})
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
				optionSetDataElement = { element: 'testOptionSetElement' };
				testTypeDataElement = { valueType: 'testType' };
				spyOn(PrintFriendlyUtils, "createOptionSetSection").and.returnValue({ testKey: [optionSetDataElement] });
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
			expect(testSections[1].isOptionSet).toBe(true);
			expect(testSections[1].testKey[0]).toEqual(optionSetDataElement);
		});

		it("should create new sections for each data element when the section has dataElements each of OptionSet Type", function() {
			testSections[0].testKey[0].valueType = "OPTIONSET";
			testSections[0].testKey[1] = clone(testSections[0].testKey[0]);
			testSections[0].testKey[2] = clone(testSections[0].testKey[0]);
			stubbedPrintFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey");
			expect(testSections.length).toBe(3);
			expect(testSections[0].isOptionSet).toBe(true);
			expect(testSections[1].isOptionSet).toBe(true);
			expect(testSections[2].isOptionSet).toBe(true);
			expect(testSections[0].testKey[0]).toEqual(optionSetDataElement);
			expect(testSections[1].testKey[0]).toEqual(optionSetDataElement);
			expect(testSections[2].testKey[0]).toEqual(optionSetDataElement);
		});

		it("should create new sections for each data element of option set type and a collective section of another type", function() {
			testSections[0].testKey[0].valueType = "OPTIONSET";
			testSections[0].testKey[1] = clone(testSections[0].testKey[0]);
			testSections[0].testKey[2] = testTypeDataElement;
			testSections[0].testKey[3] = testTypeDataElement;
			stubbedPrintFriendlyUtils.divideOptionSetsIntoNewSections(testSections, 0, "testKey");
			expect(testSections.length).toBe(3);
			expect(testSections[0].isOptionSet).toBe(true);
			expect(testSections[1].isOptionSet).toBe(true);
			expect(testSections[0].testKey[0]).toEqual(optionSetDataElement);
			expect(testSections[1].testKey[0]).toEqual(optionSetDataElement);
			expect(testSections[2].testKey[0]).toEqual(testTypeDataElement);
			expect(testSections[2].testKey[1]).toEqual(testTypeDataElement);
		});

	});

	describe("divideCatCombsIfNecessary", function() {
		var testSections;
		beforeEach(function() {
			config.DataSet.numberOfCOCColumns = 5;

			testSections = [{
				testKey  : [{ categoryCombo: { categoryOptionCombos: [] } }],
				isCatComb: true
			}
			];
		});

		it("should not create new sections if the number of columns is equal to number of columns that can fit on the page", function() {
			testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5]
			var expectedSections = clone(testSections);
			printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
			expect(expectedSections.length).toEqual(testSections.length);
			expect(expectedSections).toEqual(testSections);
		});

		it("should not create new sections if the number of columns is less than the number of columns that can fit on the page", function() {
			testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3];
			var expectedSections = clone(testSections);
			printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
			expect(expectedSections.length).toEqual(testSections.length);
			expect(expectedSections).toEqual(testSections);
		});

		describe("when number of columns overflow", function() {
			it("should create new sections", function() {
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections.length).toEqual(2);
			});

			it("should create new section with only overflown categoryOptionCombinations", function() {
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].testKey[0].categoryCombo.categoryOptionCombos).toEqual([6, 7]);
			});

			it("should remove overflowing categoryOptionCombinations", function() {
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[0].testKey[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
			});

			it("should create a duplicate section to accommodate overflown categoryOptionCombos", function() {
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].isDuplicate).toBe(true);
			});

			it("should not create a section with a single categoryOptionCombo", function() {
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 0, "testKey");
				expect(testSections[1].testKey[0].categoryCombo.categoryOptionCombos).toEqual([5, 6]);
			});

			it("should create new sections only after the given index", function() {
				testSections[1] = clone(testSections[0]);
				testSections[2] = clone(testSections[0]);
				testSections[0].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4];
				testSections[1].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5, 6, 7];
				testSections[2].testKey[0].categoryCombo.categoryOptionCombos = [1, 2, 3, 4, 5];
				printFriendlyUtils.divideCatCombsIfNecessary(testSections, 1, "testKey");
				expect(testSections[0].testKey[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4]);
				expect(testSections[1].testKey[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
				expect(testSections[2].testKey[0].categoryCombo.categoryOptionCombos).toEqual([6, 7]);
				expect(testSections[2].isDuplicate).toBe(true);
				expect(testSections[3].testKey[0].categoryCombo.categoryOptionCombos).toEqual([1, 2, 3, 4, 5]);
			});
		});

	});

	describe("splitLeftAndRightElements", function() {
		var testSections;
		beforeEach(function() {
			testSections = [{
				testKey: []
			}];
		});

		describe(" when number of data elements are zero", function() {
			it("should have empty left and right side elements", function() {
				printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
				expect(testSections[0].leftSideElements).toEqual([]);
				expect(testSections[0].rightSideElements).toEqual([]);
			});
		});

		describe("when number of data elements are even", function() {
			it("should split data elements into left and right side elements equally ", function() {
				testSections[0].testKey = [1, 2, 3, 4];
				printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
				expect(testSections[0].leftSideElements.length).toEqual(testSections[0].rightSideElements.length);
				expect(testSections[0].leftSideElements).toEqual([1, 2]);
				expect(testSections[0].rightSideElements).toEqual([3, 4]);
			});
		});

		describe("when number of data elements are odd", function() {
			it("should have left side elements more than right side elements ", function() {
				testSections[0].testKey = [1, 2, 3, 4, 5];
				printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
				expect(testSections[0].leftSideElements.length).toBe(3);
				expect(testSections[0].rightSideElements.length).toBe(2);
				expect(testSections[0].leftSideElements).toEqual([1, 2, 3]);
				expect(testSections[0].rightSideElements).toEqual([4, 5]);
			});
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
