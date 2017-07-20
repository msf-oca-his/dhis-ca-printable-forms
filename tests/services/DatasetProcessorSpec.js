describe("DataSetProcessor", function() {
	var dataSetProcessor, DefaultContent, OptionSetContent;
	var config;
	var DataSetPage;
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		config = {
			PageTypes: {
				A4: {
					Portrait: {
						height: 297,
						width: 210,
						borderTop: 15,
						borderBottom: 15,
						borderLeft: 15,
						borderRight: 15,
						availableHeight: 237,
						availableWidth: 183
					}
				}
			},
			DataSet: {
				heightOfTableHeader: 15,
				heightOfDataElementInCatCombTable: 12,
				defaultHeightOfDataElementLabel: 9,
        gapBetweenColumnsInDefaultRendering: 10,
        heightOfSectionTitle: 5,
        heightOfDataSetTitle: 5.5,
        gapBetweenSections: 3,
        pageHeaderHeight: 9,
        numberOfCOCColumns: 5,
        widthOfCategoryOptionCombo: 30,
        widthOfDataElement: 40,
        numberOfColumnsInDefaultRendering: 2
			},
			OptionSet: {
        dataElementLabelWidth: 44,
        numberOfColumns: 3,
        heightOfOption: 9,	//do not edit this value and the below one. They should be same until we start supporting different values
        dataElementLabelHeight: 9
			},
			Delimiters: {
				optionCodeEndDelimiter: "]",
				categoryOptionComboDelimiter: "<br>"
			},
			customAttributes: {
				displayOptionUID: {
					id: "444",
					options: {
						none: '0',
						text: '1',
						list: '2'
					}
				}
			}
		};

		config.DataSet.availableHeight = config.PageTypes.A4.Portrait.height - config.PageTypes.A4.Portrait.borderBottom - config.PageTypes.A4.Portrait.borderTop - config.DataSet.pageHeaderHeight;
		config.DataSet.availableWidth = config.PageTypes.A4.Portrait.width - config.PageTypes.A4.Portrait.borderRight - config.PageTypes.A4.Portrait.borderLeft;

		optionsObject = {
			123: {id: "123", name: "male", options: {name: "option1"}},
			12: {id: "12", name: "female", options: {name: "option2"}}
		};

		var mockedCustomAttribute = {
			value: "0",
			attribute: {
				id: "444"
			}
		};

		var mockedCustomAttributeService = {
			getCustomAttribute: function() {
				return Promise.resolve(mockedCustomAttribute);
			}
		};
		DefaultContent = function(section) { return section; };
		OptionSetContent = function(section) { return section; };
		module(function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('DefaultContent', DefaultContent);
			$provide.value('OptionSetContent', OptionSetContent);
			$provide.value('CustomAttributeService', mockedCustomAttributeService);
			$translateProvider.translations('en', {
				"optionset_with_incorrect_options": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator."
			})

		});
	});

	beforeEach(inject(function(DataSetProcessor, _DataSetPage_) {
		dataSetProcessor = DataSetProcessor;
		DataSetPage = _DataSetPage_;
	}));

	describe("process dataSet", function() {
		it("should process the basic dataset without sections to check page width and height", function() {
			var testDataSet = {
				id: "123",
				name: "test dataset",
				displayName: "test dataset",
				sections: [],
				type: "dataset"
			};

			var expectedPage = new DataSetPage();
			_.assignIn(expectedPage, {contents: [], datasetName: "test dataset", type: 'DATASET'});
			var expectedPages = [expectedPage];
			var actualPages = dataSetProcessor.process([testDataSet]);
			expect(expectedPages).toEqual(actualPages);
		});

		describe("sections with Only CatCombs", function() {
			var testDataSet;
			beforeEach(function() {
				testDataSet = {
					id: "123",
					name: "test dataset",
					displayName: "test dataset",
					sections: [{
						name: "section",
						displayName: "section",
						id: "134",
						categoryCombo: {
							id: "154",
							categoryOptionCombos: ["female<br><12", "male<br><10"],
							name: "catcomb"
						},
						dataElements: [{
							name: "dataElement",
							displayFormName: "dataElement",
							id: "1234",
							valueType: "TEXT",
							categoryCombo: {
								id: "154",
								categoryOptionCombos: ["female<br><12", "male<br><10"],
								name: "catcomb"
							}
						}],
						isCatComb: true
					}],
					type: "dataset"
				};
			});

			it("should process the dataset with sections of type catcomb without category optionCombos", function() {
				var dataSet = _.clone(testDataSet);
				//section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
				var expectedPage = new DataSetPage();
				_.assignIn(expectedPage, {
					contents: [{type: {type: 'DATASET_TITLE', renderer: 'dataset-title'}, data: {title: 'test dataset'}}, {
						type: Object({type: 'CATCOMB', renderer: 'category-combo'}),
						data: {title: 'section', categoryOptionCombos: ['female<br><12', 'male<br><10'], dataElementNames: ['dataElement']}
					}], heightLeft: 217.5, widthLeft: 180, type: 'DATASET', datasetName: 'test dataset'
				});
				var expectedPages = [expectedPage];
				var actualPages = dataSetProcessor.process([dataSet]);
				expect(clone(actualPages)).toEqual(clone(expectedPages));
			});

			it("should process the dataset with sections of type catcomb with category option combos", function() {
				var currentTestDataSet = _.clone(testDataSet);

				currentTestDataSet.sections[0].categoryCombo.categories = [{
					id: "123",
					name: "Gender"
				}];

				currentTestDataSet.sections[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];

				var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

				expectedSection.categoryCombo.categoryOptionCombos = ["male<br>5", "female<br>7"];

				var expectedPages = [
					{
						contents: [
							{
								type: {
									type: 'DATASET_TITLE',
									renderer: 'dataset-title'
								},
								data: {
									title: 'test dataset'
								}
							},
							{
								type: {
									type: 'CATCOMB',
									renderer: 'category-combo'
								},
								data: {
									title: 'section',
									categoryOptionCombos: ['male<br>5', 'female<br>7'],
									dataElementNames: ['dataElement']
								}
							}],
						heightLeft: 217.5,
						widthLeft: 180,
						type: 'DATASET',
						datasetName: 'test dataset'
					}];

				actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages).toEqual(clone(actualPages));
			});

			it("should process the dataset with sections of type catcomb with category option combos are overflowed", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].data.categoryOptionCombos.length).toEqual(4);
				expect(actualPages[0].contents[2].data.categoryOptionCombos.length).toEqual(2);
			});

			it("should process the dataset with overflowed section of type catcomb", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.dataElements[index] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
					}
				};
				assignCOCToSection(currentTestDataSet.sections[0], 20);
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].data.dataElementNames.length).toEqual(18);
				expect(actualPages[1].contents[1].data.dataElementNames.length).toEqual(2);
			});

			it("should process the dataset with overflowed elements are exactly one", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var assignCOCDataElementsToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.dataElements[index] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
					}
				};
				assignCOCDataElementsToSection(currentTestDataSet.sections[0], 17);
				currentTestDataSet.sections[1] = _.cloneDeep(testDataSet.sections[0]);
				assignCOCDataElementsToSection(currentTestDataSet.sections[1], 1);
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].data.dataElementNames.length).toEqual(17);
				expect(actualPages[1].contents[1].data.dataElementNames.length).toEqual(1);
			});
		});

		describe("sections of type OptionSets", function() {
			var testDataSet = {
				id: "123",
				isPrintFriendlyProcessed: true,
				name: "test dataset",
				sections: [{
					dataElements: [{
						id: "1234",
						name: "dataElement",
						options: [{id: 1, displayName: "option1"}, {id: 2, displayName: "option2"}],
						valueType: "OPTIONSET",
						attributeValues: [
							{
								value: "2",
								attribute: {
									id: "444"
								}
							}]
					}],
					id: "134",
					name: "section"
				}],
				type: 'dataset'
			};

			it("should process the section contain only one dataElement of type optionSet", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].type.type).toEqual('OPTIONSET');
				expect(actualPages[0].contents[1].data).toEqual(currentTestDataSet.sections[0]);
			});

			it("should process the dataSet which contains dataElement of type optionSets where options are overflowed", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var assignOptionsToDE = function(section, numberOfOptions) {
					for(var index = 0; index < numberOfOptions; index++) {
						section.dataElements[0].options[index] = {id: 1, displayName: "option"};
					}
				};
				assignOptionsToDE(currentTestDataSet.sections[0], 86);
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].data.dataElements[0].options.length).toEqual(81);
				expect(actualPages[1].contents[1].data.dataElements[0].options.length).toEqual(5);
			});

			it("should process the dataSet which contains dataElements of type optionSet and general dataElements", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].dataElements[1] = {
					id: "1",
					name: "general de"
				};
				currentTestDataSet.sections[0].dataElements[0].name = 'optionset_de1';
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].type.type).toEqual('OPTIONSET');
				expect(actualPages[0].contents[1].data.dataElements[0].name).toEqual('optionset_de1');
				expect(actualPages[0].contents[1].data.dataElements.length).toEqual(1);
				expect(actualPages[0].contents[2].type.type).toEqual('DEFAULT');
				expect(actualPages[0].contents[2].data.dataElements[0]).toEqual(currentTestDataSet.sections[0].dataElements[1]);
			});

			it("should process the section contain dataElement of type optionSet and displayOption text", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].dataElements[0].attributeValues[0].value = '1';
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].type.type).toEqual('DEFAULT');
				expect(actualPages[0].contents[1].data).toEqual(currentTestDataSet.sections[0]);
			});

			it("should remove dataElements from given dataElements if displayOption is none", function() {
				var dataElements = [{
					id: "123",
					name: "de1",
					displayName: "de1",
					valueType: 'OPTIONSET',
					options: ['hello'],
					attributeValues: [{attribute: {id: config.customAttributes.displayOptionUID.id}, value: '0'}]
				}];
				dataElements.push(clone(dataElements[0]));
				dataElements.push(clone(dataElements[0]));
				dataElements[1].name = 'de2';
				dataElements[2].name = 'de3';
				dataElements[1].attributeValues[0].value = 1;
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].dataElements = dataElements;
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents.length).toEqual(2);
				expect(actualPages[0].contents[1].type.type).toEqual('DEFAULT');
				expect(actualPages[0].contents[1].data.dataElements[0].name).toEqual('de2');
				expect(actualPages[0].contents[1].data.dataElements.length).toEqual(1);
			});
		});

		describe("data elements of type TEXT", function() {
			var testDataSet = {
				id: "123",
				isPrintFriendlyProcessed: true,
				name: "test dataset",
				sections: [{
					dataElements: [{
						id: "1234",
						name: "dataElement",
						valueType: "TEXT"
					}],
					id: "134",
					isCatComb: false,
					name: "section"
				}],
				type: 'dataset'
			};

			it("when dataElements of type text in a section are overflowed", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var assignDeToSections = function(section, numberOfDe) {
					for(var i = 0; i < numberOfDe; i++) {
						section.dataElements[i] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
					}
				};
				assignDeToSections(currentTestDataSet.sections[0], 60);
				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				assignDeToSections(expectedSection1, 54); //54 will fit in a page
				var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
				assignDeToSections(expectedSection2, 6);//expected would be 6
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[1].data).toEqual(expectedSection1);
				expect(actualPages[1].contents[1].data).toEqual(expectedSection2);
			});
		});

		describe("multiple datasets", function() {
			it("should give the dataset name along with its contents", function() {
				var testDataSet = {
					id: "123",
					name: "test dataset",
					displayName: "test dataset",
					sections: [{
						name: "section",
						id: "134",
						dataElements: [{
							name: "dataElement",
							id: "1234",
						}]
					}],
					type: "dataset"
				};

				var testDataSet2 = {
					id: "124",
					name: "test dataset2",
					displayName: "test dataset2",
					sections: [{
						name: "section1",
						id: "135",
						dataElements: [{
							name: "dataElement1",
							id: "1235"
						}]
					}],
					type: "dataset"
				};

				var expectedPage = new DataSetPage();
				_.assignIn(expectedPage, {contents: [], datasetName: "test dataset", type: 'DATASET'});
				var expectedPages = [expectedPage];
				var actualPages = dataSetProcessor.process([testDataSet, testDataSet2]);
				expect(actualPages[0].contents[0].data.title).toEqual(testDataSet.displayName);
				expect(actualPages[0].contents[1].data).toEqual(testDataSet.sections[0]);
				expect(actualPages[0].contents[2].data.title).toEqual(testDataSet2.displayName);
				expect(actualPages[0].contents[3].data).toEqual(testDataSet2.sections[0]);
			});
		})
	})
});
// TODO: Are these test cases enough for DatasetProcessor and are this relavent to dataset processor