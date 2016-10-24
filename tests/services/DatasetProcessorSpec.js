describe("DataSetProcessor", function() {
	var dataSetProcessor;
	var httpMock;
	var $rootScope;
	var timeout;
	var p;
	var config;
	var DataSetPage;
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		config = {
			PageTypes: {
				A4: {
					Portrait: {
						availableHeight: 237,
						availableWidth: 183,
						graceHeight: 10
					}
				}
			},
			DataSet: {
				heightOfTableHeader: 15,
				availableHeight: 237,
				availableWidth: 183,
				heightOfDataElementInCatCombTable: 12,
				heightOfDataElementInGeneralDataElement: 9,
				heightOfSectionTitle: 7,
				heightOfDataSetTitle: 10,
				gapBetweenSections: 5,
				numberOfCOCColumns: 5
			},
			CustomAttributes: {
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
		module(function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('CustomAttributeService', mockedCustomAttributeService);
			$translateProvider.translations('en', {
				"OPTIONSET_WITH_INCORRECT_OPTIONS": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator."
			})

		});
	});

	beforeEach(inject(function(DataSetProcessor, $httpBackend, $q, _$rootScope_, $timeout, _DataSetPage_) {
		dataSetProcessor = DataSetProcessor;
		p = $q;
		$rootScope = _$rootScope_;
		httpMock = $httpBackend;
		DataSetPage = _DataSetPage_;
		timeout = $timeout;
		httpMock.expectGET("i18n/en.js").respond(200, {});
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
			beforeEach(function(){
				testDataSet = {
					id: "123",
					name: "test dataset",
					displayName: "test dataset",
					sections: [{
						name: "section",
						id: "134",
						dataElements: [{
							name: "dataElement",
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
			})

			it("should process the dataset with sections of type catcomb without category optionCombos", function() {
				var dataSet = _.clone(testDataSet);
				//section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
				var expectedPage = new DataSetPage();
				_.assignIn(expectedPage, {heightLeft: 188, contents: [{type: 'dataSetName', name: "test dataset"}, {type: 'section', section: dataSet.sections[0]}], datasetName: "test dataset", type: 'DATASET'});
				var expectedPages = [expectedPage];
				var actualPages = dataSetProcessor.process([dataSet]);
				expect(expectedPages).toEqual(actualPages);
			});

			it("should process the dataset with sections of type catcomb with category option combos", function() {
				var currentTestDataSet = _.clone(testDataSet);

				currentTestDataSet.sections[0].dataElements[0].categoryCombo.categories = [{
					id: "123",
					name: "Gender"
				}];

				currentTestDataSet.sections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];

				var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

				expectedSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br>5", "female<br>7"];
				var expectedPages = [
					{
						heightLeft: 188,
						widthLeft: 183,
						contents: [
							{type: 'dataSetName', name: "test dataset"},
							{type: 'section', section: expectedSection}],
						datasetName: "test dataset",
						type: 'DATASET',
					}
				];
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(clone(actualPages)).toEqual(expectedPages);
			});

			it("should process the dataset with sections of type catcomb with catgory option combos are overflowed", function() {

				var currentTestDataSet = _.cloneDeep(testDataSet);

				currentTestDataSet.sections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];

				var expectedSection1 = _.cloneDeep(currentTestDataSet.sections[0]);

				expectedSection1.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br><5", "female<br><7", "male<br><10", "female<br><11"];

				var expectedDuplicateSection = {
					name: "section",
					id: "134",
					dataElements: [{
						name: "dataElement",
						id: "1234",
						valueType: "TEXT",
						categoryCombo: {
							id: "154",
							categoryOptionCombos: ["female<br><12", "male<br><10"],
							name: "catcomb",
						}
					}],
					isCatComb: true,
					isDuplicate: true
				};

				var expectedPages = [
					{
						heightLeft: 156,
						width: 183,
						contents: [
							{type: 'dataSetName', name: "test dataset"},
							{type: 'section', section: expectedSection1},
							{type: 'section', section: expectedDuplicateSection}],
						datasetName: "test dataset"
					}
				];
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents[2]).toEqual(expectedPages[0].contents[2]);

			});

			it("should process the dataset with overflowed section of type catcomb", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);

				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.dataElements[index] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
					}
				};

				assignCOCToSection(currentTestDataSet.sections[0], 20);

				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				assignCOCToSection(expectedSection1, 16); //because 17 elements will fit into the first page

				var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
				assignCOCToSection(expectedSection2, 4);
				expectedSection2.isDuplicate = false;
				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test dataset"
				},
					{
						heightLeft: 164,
						width: 183,
						contents: [
							{type: 'dataSetName', name: "test dataset"},
							{type: 'section', section: expectedSection2}],
						datasetName: "test dataset"
					}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);

				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
			});

			it("should process the dataset with overflowed elements are exactly one", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);

				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.dataElements[index] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
					}
				};

				assignCOCToSection(currentTestDataSet.sections[0], 15);
				currentTestDataSet.sections[1] = _.cloneDeep(testDataSet.sections[0]);
				assignCOCToSection(currentTestDataSet.sections[1], 1);
				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				assignCOCToSection(expectedSection1, 15); //because 17 elements will fit into the first page
				var expectedSection2 = _.cloneDeep(currentTestDataSet.sections[1]);
				assignCOCToSection(expectedSection2, 1);
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test dataset"
				}, {
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection2}
					]
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents)
			});
		});

		describe("sections of type OptionSets", function() {
			var testDataSet = {
				id: "123",
				isPrintFriendlyProcessed: true,
				isResolved: Promise.resolve({}),
				name: "test dataset",
				sections: [{
					dataElements: [{
						id: "1234",
						isResolved: Promise.resolve({}),
						name: "dataElement",
						options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
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
					isResolved: Promise.resolve({}),
					name: "section"
				}],
				type: 'dataset'
			};

			it("should process the section contain only one dataElement of type optionSet", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);

				var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

				var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

				expectedSection.dataElements[0].rows = expectedRows;
				expectedSection.dataElements[0].displayOption = "2";
				expectedSection.isOptionSet = true;
				var expectedPages = [{
					heightLeft: 0,
					widthLeft: 183,
					contents: [{
						type: 'dataSetName',
						name: "test dataset"
					}, {
						type: 'section',
						section: expectedSection
					}],
					datasetName: "test dataset"
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents);
			});

			xit("should show an alert if value of custom attribute is not matching with config options", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].dataElements[0].attributeValues[0].value = '5';
				spyOn(window, 'alert');
				dataSetProcessor.process([currentTestDataSet]);
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.");
				});
				$rootScope.$digest();
			});

			it("should process the dataSet which contains dataElement of type optionSets where options are overflowed", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);

				var assignOptionsToDE = function(section, numberOfOptions) {
					for(var index = 0; index < numberOfOptions; index++) {
						section.dataElements[0].options[index] = {id: 1, name: "option"};
					}
				};
				assignOptionsToDE(currentTestDataSet.sections[0], 76);   //75 options will overflow to the new page

				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				assignOptionsToDE(expectedSection1, 69);
				var expectedRows1 = [];
				for(var i = 0; i < 23; i++) {
					var j = 0;
					while(j < 3) {
						if(j == 0)
							expectedRows1.push([{id: 1, name: "option"}]);
						else
							expectedRows1[i].push({id: 1, name: "option"});
						j++;
					}
				}
				expectedSection1.dataElements[0].rows = expectedRows1;
				expectedSection1.isOptionSet = true;
				expectedSection1.dataElements[0].displayOption = "2";

				var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
				assignOptionsToDE(expectedSection2, 7);
				var expectedRows2 = [];
				expectedRows2[0] = [];
				expectedRows2[1] = [];
				expectedRows2[2] = [];
				expectedRows2[0].push({id: 1, name: "option"}, {id: 1, name: "option"}, {id: 1, name: "option"});
				expectedRows2[1].push({id: 1, name: "option"}, {id: 1, name: "option"} );
				expectedRows2[2].push({id: 1, name: "option"}, {id: 1, name: "option"});

				expectedSection2.dataElements[0].rows = expectedRows2;
				expectedSection2.isOptionSet = true;
				expectedSection2.dataElements[0].displayOption = config.CustomAttributes.displayOptionUID.options.list;
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test dataset"
				}, {
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection2}],
					datasetName: "test dataset"
				}];
				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages[1].contents).toEqual(actualPages[1].contents);
				expect(expectedPages[0].contents[1]).toEqual(actualPages[0].contents[1]);
			});

			it("should process the dataSet which contains dataElements of type optionSet and general dataElements", function() {
				var currentTestDataSet = _.cloneDeep(testDataSet);
				currentTestDataSet.sections[0].dataElements[1] = {
					id: "1",
					name: "general de"
				};

				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				var expectedRows1 = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
				expectedSection1.dataElements[0].rows = expectedRows1;
				expectedSection1.isDuplicate = false;
				expectedSection1.isOptionSet = true;
				expectedSection1.dataElements[0].displayOption = "2";

				var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
				expectedSection2.dataElements[0] = currentTestDataSet.sections[0].dataElements[1];
				expectedSection2.isDuplicate = true;
				expectedSection2.leftSideElements = [currentTestDataSet.sections[0].dataElements[1]];
				expectedSection2.rightSideElements = [];

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection1},
						{type: 'section', section: expectedSection2}],
					datasetName: "test dataset"
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents)
			});

			it("should process the section contain dataElement of type optionSet and displayOption text", function() {
				var testDataSet = {
					id: "123",
					isPrintFriendlyProcessed: true,
					isResolved: Promise.resolve({}),
					name: "test dataset",
					sections: [{
						dataElements: [{
							id: "1234",
							isResolved: Promise.resolve({}),
							name: "dataElement",
							options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
							valueType: "OPTIONSET",
							attributeValues: [
								{
									value: "1",
									attribute: {
										id: "444"
									}
								}]
						}],
						id: "134",
						isResolved: Promise.resolve({}),
						name: "section"
					}],
					type: 'dataset'
				};
				var currentTestDataSet = _.cloneDeep(testDataSet);
				var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);
				expectedSection.leftSideElements = [currentTestDataSet.sections[0].dataElements[0]];				expectedSection.leftSideElements[0].displayOption = "1";
				expectedSection.rightSideElements = [];
				expectedSection.leftSideElements[0].displayOption = "1";
				expectedSection.dataElements[0].displayOption = "1";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [{
						type: 'dataSetName',
						name: "test dataset"
					}, {
						type: 'section',
						section: expectedSection
					}],
					datasetName: "test dataset"
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents);
			});

			it("should remove dataElements from given dataElements if displayOption is none", function() {

				var dataElements = [{
					id: "123",
					name: "de1",
					displayName: "de1",
					valueType: 'OPTIONSET',
					attributeValues: [{attribute: {id: config.CustomAttributes.displayOptionUID.id}, value: '0'}]
				},
					{
						id: "134",
						name: "de2",
						displayName: "de2",
						valueType: 'OPTIONSET',
						attributeValues: [{attribute: {id: config.CustomAttributes.displayOptionUID.id}, value: '1'}]
					},
					{
						id: "222",
						name: "de3",
						displayName: "de3",
						valueType: 'OPTIONSET',
						attributeValues: [{attribute: {id: config.CustomAttributes.displayOptionUID.id}, value: '0'}]
					}
				];

				var currentTestDataSet = _.cloneDeep(testDataSet);

				var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

				currentTestDataSet.sections[0].dataElements = dataElements;
				var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
				expectedSection.dataElements[0] = dataElements[1];
				expectedSection.dataElements[0].displayOption = config.CustomAttributes.displayOptionUID.options.text;
				expectedSection.dataElements[0].rows = expectedRows;
				expectedSection.isOptionSet = true;

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [{
						type: 'dataSetName',
						name: "test dataset"
					}, {
						type: 'section',
						section: expectedSection
					}],
					datasetName: "test dataset"
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(expectedPages[0].contents[1].section.dataElements).toEqual(actualPages[0].contents[1].section.dataElements);
			});
		});

		describe("data elements of type TEXT", function() {
			var testDataSet = {
				id: "123",
				isPrintFriendlyProcessed: true,
				isResolved: Promise.resolve({}),
				name: "test dataset",
				sections: [{
					dataElements: [{
						id: "1234",
						isResolved: Promise.resolve({}),
						name: "dataElement",
						valueType: "TEXT"
					}],
					id: "134",
					isCatComb: false,
					isResolved: Promise.resolve({}),
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
				}
				assignDeToSections(currentTestDataSet.sections[0], 50);

				var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
				var expectedNumberOfElements = 48;
				assignDeToSections(expectedSection1, expectedNumberOfElements);
				expectedSection1.leftSideElements = [];
				expectedSection1.rightSideElements = [];
				for(var i = 0; i < expectedNumberOfElements; i++) {
					if(i < (expectedNumberOfElements / 2))
						expectedSection1.leftSideElements.push(currentTestDataSet.sections[0].dataElements[i]);
					else
						expectedSection1.rightSideElements.push(currentTestDataSet.sections[0].dataElements[i]);
				}
				;

				var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
				assignDeToSections(expectedSection2, 2);//expected would be 2
				expectedSection2.leftSideElements = [{
					id: "1234",
					isResolved: Promise.resolve({}),
					name: "dataElement",
					valueType: "TEXT"
				}];
				expectedSection2.rightSideElements = [{
					id: "1234",
					isResolved: Promise.resolve({}),
					name: "dataElement",
					valueType: "TEXT"
				}];
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test dataset"
				}, {
					contents: [
						{type: 'dataSetName', name: "test dataset"},
						{type: 'section', section: expectedSection2}
					]
				}];

				var actualPages = dataSetProcessor.process([currentTestDataSet]);
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
			});
		});
	})
});
// todo: Are these test cases enough for DatasetProcessor