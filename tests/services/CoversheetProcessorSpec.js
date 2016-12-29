describe("Coversheet Processor", function() {
	var coversheetProcessor, _DataElement, DefaultContent, OptionSetContent;
	var $rootScope;
	var p;
	var config = {
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
			optionLabelDelimiter: "]"
		},
		customAttributes: {
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
		DefaultContent = function(section) {
			section.mockedBy = 'DefaultContent';
			return section;
		};
		OptionSetContent = function(section) {
			section.mockedBy = 'OptionSetContent';
			return section;
		};
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
			$provide.value('DefaultContent', DefaultContent);
			$provide.value('OptionSetContent', OptionSetContent);
		});

		inject(function(CoversheetProcessor, $q, _$rootScope_, DataElement) {
			coversheetProcessor = CoversheetProcessor;
			p = $q;
			$rootScope = _$rootScope_;
			_DataElement = DataElement;
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
				contents: [{type: {type: 'COMMENTS', renderer: 'comments'}}],
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
								options: [{id: 1, displayName: "option1"}, {id: 2, displayName: "option2"}],
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
				expect(actualPages[0].contents[0].type.type).toBe('OPTIONSET')
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
									options: [{id: 1, displayName: "option1"}, {id: 2, displayName: "option2"}],
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
				var actualPages = coversheetProcessor.process(currentTestProgram, 'COVERSHEET');
				expect(actualPages[0].contents[0].type.renderer).toEqual('default-content');
				expect(actualPages[0].contents[0].data.programStageDataElements[0]).toEqual(testProgram.programStages[0].programStageSections[0].programStageDataElements[0]);
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
						section.programStageDataElements[0].options[index] = {id: 1, displayName: "option"};
					}
				};
				assignOptionsToDe(currentTestProgram.programStages[0].programStageSections[0], 76);//75 options will overflow to the new page

				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignOptionsToDe(expectedSection1, 69);
				var acutalPages = coversheetProcessor.process(currentTestProgram);
				expect(acutalPages[0].contents[0].data.programStageDataElements[0].options.length).toEqual(75);
				expect(acutalPages[1].contents[0].data.programStageDataElements[0].options.length).toEqual(1);
			});

			it("should process the program which contains dataElements of type option set and general (default) dataElements", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "1",
					name: "general de"
				};
				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				expectedSection1.programStageDataElements[0].displayOption = "2";
				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				expectedSection2.programStageDataElements[0] = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1];
				expectedSection2.isDuplicate = true;

				var expectedPages = [{
					contents: [
						{type: 'programName', name: "test program"},
						{type: 'section', section: expectedSection1},
						{type: 'section', section: expectedSection2},
						{type: 'comments'}],
					datasetName: "test program"
				}];

				var actualPages = coversheetProcessor.process(currentTestProgram);
				expect(actualPages[0].contents[0].type.type).toBe('OPTIONSET');
				expect(actualPages[0].contents[0].data, expectedSection1);
				expect(actualPages[0].contents[1].data, expectedSection2);
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
				};
				assignDeToSections(currentTestProgram.programStages[0].programStageSections[0], 52);
				var expectedSection1 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				var expectedNumberOfElements = 50;
				assignDeToSections(expectedSection1, expectedNumberOfElements);
				var expectedSection2 = _.cloneDeep(testProgram.programStages[0].programStageSections[0]);
				assignDeToSections(expectedSection2, 2);//expected would be 2
				var actualPages = coversheetProcessor.process(currentTestProgram);
				expect(actualPages[0].contents[0].data.programStageDataElements.length).toEqual(50);
				expect(actualPages[1].contents[0].data.programStageDataElements.length).toEqual(2);
			});
		});
	})
});

// TODO: Are these test cases enough for ProgramProcessor