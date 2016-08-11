describe("ProgramProcessor", function() {
	var programProcessor, _DataElement;
	var httpMock;
	var $rootScope;
	var timeout;
	var p;
	var config = {
		Register: {
			availableHeight: 175,
			availableWidth: 270,
			labelHeight: 10,            //table header
			tableHeaderHeight: 10,           //page header
			dataEntryRowHeight: 9,
			headerHeight: 25,
			textElementWidth: 50,
			otherElementWidth: 30
		},
		DataSet: {
			heightOfTableHeader: 15,
			heightOfDataElementInCatCombTable: 12,
			heightOfDataElementInGeneralDataElement: 9,
			heightOfSectionTitle: 7,
			heightOfDataSetTitle: 10,
			gapBetweenSections: 5,
			graceHeight: 10,
			availableHeight: 237,
			availableWidth: 183,
			numberOfCOCColumns: 5
		},
		OptionSet: {
			labelPadding: 4,
			dataElementLabel: 48,
			optionsPadding: 12
		},
		Prefixes: {
			dataSetPrefix: "DS_",
			programPrefix: "PROG_"
		},
		DisplayOptions: {//TODO: make the code values string instead of numbers.
			none: 0,
			text: 1,
			list: 2
		},
		CustomAttributes: {
			displayOptionUID: "111"
		}
	};

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		optionsObject = {
			123: {id: "123", name: "male", options: {name: "option1"}},
			12: {id: "12", name: "female", options: {name: "option2"}}
		};
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function(ProgramProcessor, $httpBackend, $q, _$rootScope_, $timeout, DataElement) {
		programProcessor = ProgramProcessor;
		p = $q;
		$rootScope = _$rootScope_;
		httpMock = $httpBackend;
		timeout = $timeout;
		_DataElement = DataElement
		httpMock.expectGET("i18n/en.json").respond(200, {});
	}));

	describe("process program of type coversheet", function() {
		it("should process the basic program without stage sections to check page width and height", function() {
			var testProgram = {
				id: "123",
				name: "test program",
				programStages: [{programStageSections: []}],
				type: "program",
			};

			var expectedPages = [{
				heightLeft: config.DataSet.availableHeight,
				widthLeft: config.DataSet.availableWidth,
				contents: [{type: 'comments'}],
				programName: "test program"
			}];

			var actualPages = programProcessor.process(testProgram, 'COVERSHEET');
			expect(actualPages).toEqual(expectedPages);
		});

		describe("sections with Only Catcombs", function() {

			var testProgram = {
				id: "123",
				name: "test program",
				programStages: [
					{
						programStageSections: [{
							programStageDataElements: [{
								categoryCombo: {
									id: "154",
									categoryOptionCombos: ["female<br><12", "male<br><10"],
									name: "catcomb"
								},
								id: "1234",
								name: "dataElement",
								type: "TEXT",
							}

							],
							id: "1234",
							isCatComb: true,
							name: "test section"
						}]
					},
				],

			};

			it("should process the program with sections of type catcomb without category optionCombos", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				//section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
				var expectedPages = [
					{
						heightLeft: 188,
						widthLeft: 183,
						contents: [
							{type: 'dataSetName', name: "test program"},
							{type: 'section', section: currentTestProgram.programStages[0].programStageSections[0]},
							{type: 'comments'}
						],
						programName: "test program"
					}
				];
				var actualPages = programProcessor.process(currentTestProgram, "COVERSHEET");
				expect(actualPages).toEqual(expectedPages);
			});

			it("should process the program with sections of type catcomb with category option combos", function() {
				var currentTestProgram = _.clone(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].categoryCombo.categories = [{
					id: "123",
					name: "Gender"
				}];

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];

				var expectedSection = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[0]);

				expectedSection.programStageDataElements[0].categoryCombo.categoryOptionCombos = ["male<br>5", "female<br>7"];

				var expectedPages = [
					{
						heightLeft: 188,
						widthLeft: 183,
						contents: [
							{type: 'dataSetName', name: "test program"},
							{type: 'section', section: expectedSection},
							{type: 'comments'}
						],
						programName: "test program"
					}
				];
				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(actualPages).toEqual(expectedPages);
			});

			it("should process the program with sections of type catcomb with catgory option combos are overflowed", function() {

				var currentProgram = _.cloneDeep(testProgram);

				currentProgram.programStages[0].programStageSections[0].programStageDataElements[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];

				var expectedSection1 = _.cloneDeep(currentProgram.programStages[0].programStageSections[0]);

				expectedSection1.programStageDataElements[0].categoryCombo.categoryOptionCombos = ["male<br><5", "female<br><7", "male<br><10", "female<br><11"];

				var expectedDuplicateSection = {
					name: "test section",
					id: "1234",
					programStageDataElements: [{
						name: "dataElement",
						id: "1234",
						type: "TEXT",
						categoryCombo: {
							id: "154",
							categoryOptionCombos: ["female<br><12", "male<br><10"],
							name: "catcomb",
							categories: [{id: '123', name: 'Gender'}]
						}
					}],
					isCatComb: true,
					isDuplicate: true
				};

				var expectedPages = [{
					heightLeft: 156,
					widthLeft: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1},
						{type: 'section', section: expectedDuplicateSection},
						{type: 'comments'}
					],
					programName: "test program"
				}];

				var actualPages = programProcessor.process(currentProgram, 'COVERSHEET');
				expect(actualPages[0]).toEqual(expectedPages[0]);

			});

			it("should process the program with overflowed section of type catcomb", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.programStageDataElements[index] = _.cloneDeep(testProgram.programStages[0].programStageSections[0].programStageDataElements[0]);
					}
				};

				assignCOCToSection(currentTestProgram.programStages[0].programStageSections[0], 20);

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignCOCToSection(expectedSection1, 16); //because 16 elements will fit into the first page

				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignCOCToSection(expectedSection2, 4);
				expectedSection2.isDuplicate = false;
				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				},
					{
						heightLeft: 164,
						width: 183,
						contents: [
							{type: 'section', section: expectedSection2},
							{type: 'comments'}],
						datasetName: "test program"
					}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');

				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
			});

			it("should process the program with overflowed section height is less than grace height", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.programStageDataElements[index] = _.cloneDeep(testProgram.programStages[0].programStageSections[0].programStageDataElements[0]);
					}
				};

				assignCOCToSection(currentTestProgram.programStages[0].programStageSections[0], 17);

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignCOCToSection(expectedSection1, 17); //because 17 elements will fit into the first page
				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
			});

			it("should process the dataset with overflowed elements are exactly one", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var assignCOCToSection = function(section, numofDe) {
					for(var index = 0; index < numofDe; index++) {
						section.programStageDataElements[index] = _.cloneDeep(testProgram.programStages[0].programStageSections[0].programStageDataElements[0]);
					}
				};

				assignCOCToSection(currentTestProgram.programStages[0].programStageSections[0], 15);
				currentTestProgram.programStages[0].programStageSections[1] = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignCOCToSection(currentTestProgram.programStages[0].programStageSections[1], 1);
				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignCOCToSection(expectedSection1, 15); //because 17 elements will fit into the first page
				var expectedSection2 = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[1]);
				assignCOCToSection(expectedSection2, 1);
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				}, {
					contents: [
						{type: 'section', section: expectedSection2},
						{type: 'comments'}
					]
				}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents)
			});

		});

		describe("Section with option sets", function() {
			var testProgram = {
				id: "123",
				name: "test program",
				programStages: [
					{
						programStageSections: [{
							programStageDataElements: [{
								id: "1234",
								name: "dataElement",
								options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
								valueType: "OPTIONSET",
								attributeValues: [
									{
										value: "1",
										attribute: {
											id: "111"
										}
									}]
							}],
							id: "134",
							name: "section"
						}]
					}]
			};

			it("should process the section contain only one dataelement of type optionset", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var expectedSection = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[0]);

				var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

				expectedSection.programStageDataElements[0].rows = expectedRows;
				expectedSection.isOptionSet = true;
				expectedSection.programStageDataElements[0].displayOption = "1";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents);
			});

			it("should remove dataElements from given dataElements if displayOption is none", function() {


				var dataElements = [{
					id: "123",
					name: "de",
					displayName: "de",
					displayOption: '0'
				},
					{
						id: "134",
						name: "de",
						displayName: "de",
						displayOption: '1'
					},
					{
						id: "222",
						name: "de3",
						displayName: "de",
						displayOption: '0'
					}
				];

				var currentTestProgram = _.cloneDeep(testProgram);

				var expectedSection = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[0]);

				var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
				expectedSection.programStageDataElements[1] = dataElements[1];
				expectedSection.programStageDataElements[0].rows = expectedRows;
				expectedSection.programStageDataElements[1].rows = expectedRows;

				expectedSection.isOptionSet = true;
				expectedSection.programStageDataElements[0].displayOption = "1";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection},
						{type: 'comments'}],
					datasetName: "test program"
				}];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = dataElements[0];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = dataElements[1];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[3] = dataElements[2];

				var actualPages = programProcessor.process(currentTestProgram, 'REGISTER');
				expect(expectedPages[0].contents.programStageDataElements).toEqual(actualPages[0].contents.programStageDataElements);
			});

			it("should process the program which contians dataelement of type optionsets where options are overflowed", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var assignOptionsToDe = function(section, numberOfOptions) {
					for(var index = 0; index < numberOfOptions; index++) {
						section.programStageDataElements[0].options[index] = {id: 1, name: "option"};
					}
				};
				assignOptionsToDe(currentTestProgram.programStages[0].programStageSections[0], 76);//75 options will overflow to the new page

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignOptionsToDe(expectedSection1, 72);
				var expectedRows1 = [];
				for(var i = 0; i < 24; i++) {
					var j = 0;
					while(j < 3) {
						if(j == 0)
							expectedRows1.push([{id: 1, name: "option"}]);
						else
							expectedRows1[i].push({id: 1, name: "option"});
						j++;
					}
				}

				expectedSection1.programStageDataElements[0].rows = expectedRows1;
				expectedSection1.isOptionSet = true;
				expectedSection1.programStageDataElements[0].displayOption = "1";



				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignOptionsToDe(expectedSection2, 4);

				var expectedRows2 = [];
				expectedRows2[0] = [];
				expectedRows2[1] = []
				expectedRows2[0].push({id: 1, name: "option"}, {id: 1, name: "option"});

				expectedRows2[1].push({id: 1, name: "option"}, {id: 1, name: "option"});

				expectedSection2.programStageDataElements[0].rows = expectedRows2;
				expectedSection2.isOptionSet = true;
				expectedSection2.programStageDataElements[0].displayOption = "1";
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				}, {
					contents: [
						{type: 'section', section: expectedSection2},
						{type: 'comments'}],
					datasetName: "test program"
				}];
				var acutalPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(expectedPages[1].contents ).toEqual(acutalPages[1].contents);
				expect(expectedPages[0].contents[1]).toEqual(acutalPages[0].contents[1]);
			});

			it("should process the program which contains dataelements of type option set and general dataelements", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "1",
					name: "general de"
				};

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				var expectedRows1 = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
				expectedSection1.programStageDataElements[0].rows = expectedRows1;
				expectedSection1.isDuplicate = false;
				expectedSection1.isOptionSet = true;
				expectedSection1.programStageDataElements[0].displayOption = "1";


				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				expectedSection2.programStageDataElements[0] = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1];
				expectedSection2.isDuplicate = true;
				expectedSection2.leftSideElements = [currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1]];
				expectedSection2.rightSideElements = [];

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1},
						{type: 'section', section: expectedSection2},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents);
			});

		});

		describe("program-coversheets of type TEXT", function() {
			var testProgram = {
				id: "123",
				name: "test program",
				programStages: [{
					programStageSections: [{
						programStageDataElements: [{
							id: "1234",
							isResolved: Promise.resolve({}),
							name: "dataElement",
							type: "TEXT"
						}],
						id: "134",
						isCatComb: false,
						isResolved: Promise.resolve({}),
						name: "section"
					}]
				}],
				type: 'program'
			};
			it("when dataelements of type text in a section are overflowed", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				var assignDeToSections = function(section, numberOfDe) {
					for(var i = 0; i < numberOfDe; i++) {
						section.programStageDataElements[i] = _.cloneDeep(testProgram.programStages[0].programStageSections[0].programStageDataElements[0]);
					}
				}
				assignDeToSections(currentTestProgram.programStages[0].programStageSections[0], 50);

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				var expectedNumberOfElements = 48;
				assignDeToSections(expectedSection1, expectedNumberOfElements);
				expectedSection1.leftSideElements = [];
				expectedSection1.rightSideElements = [];
				for(var i = 0; i < expectedNumberOfElements; i++) {
					if(i < (expectedNumberOfElements / 2))
						expectedSection1.leftSideElements.push(currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[i]);
					else
						expectedSection1.rightSideElements.push(currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[i]);
				}
				;

				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignDeToSections(expectedSection2, 2);//expected would be 2
				expectedSection2.leftSideElements = [{
					id: "1234",
					isResolved: Promise.resolve({}),
					name: "dataElement",
					type: "TEXT"
				}];
				expectedSection2.rightSideElements = [{
					id: "1234",
					isResolved: Promise.resolve({}),
					name: "dataElement",
					type: "TEXT"
				}];
				expectedSection2.isDuplicate = false;

				var expectedPages = [{
					contents: [
						{type: 'dataSetName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				}, {
					contents: [
						{type: 'section', section: expectedSection2},
						{type: "comments"}
					]
				}];

				var actualPages = programProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
			});

		});

		describe("program-register", function() {
			var testProgram = {
				    id: "123",
				    name: "test program",
				    programStages: [{
					    programStageSections: [{
						    programStageDataElements: [],
						    id: "134",
						    isCatComb: false,
						    name: "section"
					    }]
				    }],
				    type: 'program'
			    }
				;

			it("should test regiseters page width and height and test the register which contains only comments data element", function() {
				var expectedPages = [{
					heightLeft: 150,
					widthLeft: 220,
					contents: [
						new _DataElement({name: 'Comments', type: 'TEXT'})],
					programName: 'test program',
				}];

				var actualPages = programProcessor.process(testProgram, 'REGISTER');
				expect(actualPages[0]).toEqual(expectedPages[0])
			});
			it("should test Orphan DataElements", function() {
				var currentTestProgram = _.clone(testProgram);

				for(var i = 0; i < 5; i++) {
					currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[i] = {
						name: "dataElement",
						id: "1234",
						valueType: "TEXT"
					};
				}

				var expectedPages = [{
					heightLeft: 0,
					widthLeft: 0,
					contents: [
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						{name: "dataElement", id: "1234", valueType: "TEXT"},
					],
					programName: 'test program',
				},
					{
						heightLeft: 30,
						widthLeft: 0,
						contents: [
							{name: "dataElement", id: "1234", valueType: "TEXT"},
							new _DataElement({name: 'Comments', type: 'TEXT'})
						],
						programName: 'test program'
					}];

				var actualPages = programProcessor.process(testProgram, 'REGISTER');
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents)
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents)
			});

			it("should test the last second element can be fit into the current page or not", function() {
				var currentTestProgram = _.clone(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0] = {
					name: "dataElement",
					id: "1234",
					valueType: "TEXT"

				};

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					name: "dataElement",
					id: "1234",
					valueType: "OPTIONSET"

				};

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					name: "dataElement",
					id: "1234",
					valueType: "OPTIONSET"

				};

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[3] = {
					name: "dataElement",
					id: "1234",
					valueType: "TEXT"

				};

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[4] = {
					name: "dataElement",
					id: "1234",
					valueType: "TEXT"
				};

				var expectedPages = [{
					heightLeft: 0,
					widthLeft: 0,
					contents: [
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						{name: "dataElement", id: "1234", valueType: "OPTIONSET"},
						{name: "dataElement", id: "1234", valueType: "OPTIONSET"},
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						new _DataElement({name: 'Comments', valueType: 'TEXT'})
					],
					programName: 'test program',
				}];

				var actualPages = programProcessor.process(testProgram, 'REGISTER');
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents)
			})
		})

	})
});
// todo: Are these test cases enough for ProgramProcessor