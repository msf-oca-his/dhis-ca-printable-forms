describe("Coversheet Processor", function() {
	var coversheetProcessor, _DataElement;
	var httpMock;
	var $rootScope;
	var p;
	var config = {
		PageTypes: {
			A4: {
				Portrait: {
					availableHeight: 237,
					availableWidth: 183,
					graceHeight: 10
				}
			}
		},
		Coversheet: {
			heightOfTableHeader: 15,
			heightOfDataElementInCatCombTable: 12,
			heightOfDataElementInGeneralDataElement: 9,
			heightOfSectionTitle: 7,
			heightOfProgramTitle: 10,
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

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function(CoversheetProcessor, $httpBackend, $q, _$rootScope_, DataElement) {
			coversheetProcessor = CoversheetProcessor;
			p = $q;
			$rootScope = _$rootScope_;
			httpMock = $httpBackend;
			_DataElement = DataElement;
			httpMock.expectGET("i18n/en.js").respond(200, {});
		})

	});

	describe("process program of type coversheet", function() {
		it("should process the basic program without stage sections to check page width and height", function() {
			var testProgram = {
				id: "123",
				name: "test program",
				displayName: "test program",
				programStages: [{programStageSections: []}],
				type: "program"
			};

			var expectedPages = [{
				heightLeft: config.PageTypes.A4.Portrait.availableHeight,
				widthLeft: config.PageTypes.A4.Portrait.availableWidth,
				contents: [{type: 'comments'}],
				type: 'COVERSHEET',
				programName: "test program"
			}];

			var actualPages = clone(coversheetProcessor.process(testProgram));
			expect(expectedPages).toEqual(actualPages);
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
										value: "2",
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

			it("should process the section contain only one dataElement of type optionSet", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var expectedSection = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[0]);

				var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

				expectedSection.programStageDataElements[0].rows = expectedRows;
				expectedSection.isOptionSet = true;
				expectedSection.programStageDataElements[0].displayOption = "2";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = clone(coversheetProcessor.process(currentTestProgram, 'COVERSHEET'));
				expect(expectedPages[0].contents).toEqual(actualPages[0].contents);
			});

			it("should process the section containing dataElement of type optionset and displayOption text", function() {
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
				var currentTestProgram = _.cloneDeep(testProgram);
				var expectedSection = _.cloneDeep(currentTestProgram.programStages[0].programStageSections[0]);
				expectedSection.leftSideElements = [currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0]];
				expectedSection.rightSideElements=[];
				expectedSection.programStageDataElements[0].displayOption = "1";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = coversheetProcessor.process(currentTestProgram, 'COVERSHEET');
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
				expectedSection.programStageDataElements[0].displayOption = "2";

				var expectedPages = [{
					heightLeft: 0,
					width: 183,
					contents: [
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection},
						{type: 'comments'}],
					datasetName: "test program"
				}];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = dataElements[0];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = dataElements[1];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[3] = dataElements[2];

				var actualPages = coversheetProcessor.process(currentTestProgram);
				expect(expectedPages[0].contents.programStageDataElements).toEqual(actualPages[0].contents.programStageDataElements);
			});

			it("should process the program which contains dataElement of type optionSets where options are overflowed", function() {

				var currentTestProgram = _.cloneDeep(testProgram);

				var assignOptionsToDe = function(section, numberOfOptions) {
					for(var index = 0; index < numberOfOptions; index++) {
						section.programStageDataElements[0].options[index] = {id: 1, name: "option"};
					}
				};
				assignOptionsToDe(currentTestProgram.programStages[0].programStageSections[0], 76);//75 options will overflow to the new page

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignOptionsToDe(expectedSection1, 69);
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

				expectedSection1.programStageDataElements[0].rows = expectedRows1;
				expectedSection1.isOptionSet = true;
				expectedSection1.programStageDataElements[0].displayOption = "2";

				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignOptionsToDe(expectedSection2, 7);

				var expectedRows2 = [];
				expectedRows2[0] = [];
				expectedRows2[1] = [];
				expectedRows2[2] = [];
				expectedRows2[0].push({id: 1, name: "option"}, {id: 1, name: "option"}, {id: 1, name: "option"});

				expectedRows2[1].push({id: 1, name: "option"}, {id: 1, name: "option"});
				expectedRows2[2].push({id: 1, name: "option"}, {id: 1, name: "option"});

				expectedSection2.programStageDataElements[0].rows = expectedRows2;
				expectedSection2.isOptionSet = true;
				expectedSection2.programStageDataElements[0].displayOption = "2";
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
				var acutalPages = coversheetProcessor.process(currentTestProgram);
				expect(expectedPages[1].contents).toEqual(acutalPages[1].contents);
				expect(expectedPages[0].contents[1]).toEqual(acutalPages[0].contents[1]);
			});

			it("should process the program which contains dataElements of type option set and general dataElements", function() {
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
				expectedSection1.programStageDataElements[0].displayOption = "2";

				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				expectedSection2.programStageDataElements[0] = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1];
				expectedSection2.isDuplicate = true;
				expectedSection2.leftSideElements = [currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1]];
				expectedSection2.rightSideElements = [];

				var expectedPages = [{
					contents: [
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection1},
						{type: 'section', section: expectedSection2},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = coversheetProcessor.process(currentTestProgram);
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
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection1}],
					datasetName: "test program"
				}, {
					contents: [
						{type: 'section', section: expectedSection2},
						{type: "comments"}
					]
				}];

				var actualPages = coversheetProcessor.process(currentTestProgram);
				expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
				expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
			});
		});
	})
});
// todo: Are these test cases enough for ProgramProcessor