describe("CodeSheet Processor", function() {
	var codeSheetProcessor;
	var $scope = {};
	var config = {};

	beforeEach(function() {
		module("TallySheets");
		config = {
			PageTypes: {
				A4: {
					Portrait: {
						availableHeight: 50,
						availableWidth: 183
					}
				}
			},
			CodeSheet: {
				heightOfProgramTitle: 10,
				rowHeight: 6,
				numberOfColumns: 3,
				pageNumberHeight: 10
			},
			Delimiters: {
				optionCodeStartDelimiter: "[",
				optionCodeEndDelimiter: "]"
			},
			customAttributes: {
				displayOptionUID: {
					id: "111",
					options: {
						none: '0'
					}
				}
			}
		};
		CodeSheetPage = function() {
			var codeSheetPage = {};
			codeSheetPage.heightLeft = config.Register.availableHeight - config.Register.pageHeaderHeight;
			codeSheetPage.widthLeft = config.Register.availableWidth;
			codeSheetPage.type = "CODESHEET";
			codeSheetPage.columns = new Array(config.CodeSheet.numberOfColumns);
			return new Page(codeSheetPage)
		};
		module(function($provide) {
			$provide.value('Config', config);
		});
		inject(function(CodeSheetProcessor, $rootScope) {
			$scope = $rootScope.$new();
			codeSheetProcessor = CodeSheetProcessor;
		})
	});

	it("should process the basic program to check for page width and height", function() {
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
			columns: [[], null, null],
			contents: [],
			type: 'CODESHEET',
			programName: "test program"
		}];

		var actualPages = clone(codeSheetProcessor.process(testProgram));
		expect(expectedPages).toEqual(actualPages);
	});

	var testProgram = {
		id: "123",
		name: "test program",
		displayName: "test program",
		programStages: [
			{
				programStageSections: [{
					programStageDataElements: [{
						id: "1234",
						displayFormName: "dataElement",
						options: [{id: 1, code: 1, displayName: "[o1]option1"}, {id: 2, code: 2, displayName: "[o2]option2"}],
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
			}],
		type: "program"
	};

	describe("Get DataElements", function() {

		it("should get only those data elements whose value type is OPTION SET", function() {
			var currentTestProgram = _.cloneDeep(testProgram);

			currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
				id: "111",
				displayFormName: "de1",
				valueType: "INTEGER"
			};
			currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
				id: "112",
				displayFormName: "de2",
				valueType: "TEXT"
			};

			var expectedPages = [{
				contents: [],
				type: 'CODESHEET',
				columns: [[
					{code: "Code", label: "dataElement", type: "HEADING"},
					{code: "o1", label: "option1", type: "LABEL"},
					{code: "o2", label: "option2", type: "LABEL"},
					{code: '', label: '', type: "GAP"}
				]]
			}];

			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages[0].columns[0]).toEqual(actualPages[0].columns[0]);
		});

		describe("Code of the option for single delimiter", function() {
			it("should fetch the code of option from the option label", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
			});

			it("should give the code of the option as blank when there is no end delimiter", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[0].displayName = "[o1 option1";
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[1].displayName = "[o2 option2";

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "", label: "option1", type: "LABEL"},
						{code: "", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
			});

			it("should give the code of the option as the remaining part which is before the end delimiter in the label", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[0].displayName = "[o1] option1";
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[1].displayName = "o2] option2";

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
				expect(expectedPages[0].columns[0][2].code).toEqual(actualPages[0].columns[0][2].code);
			});
		});

		describe("Code of the option for multiple delimiters", function() {
			beforeEach(function() {
				config.Delimiters.optionCodeStartDelimiter = '[[[';
				config.Delimiters.optionCodeEndDelimiter = ']]]';
			});

			it("should fetch the code of option from the option label", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[0].displayName = "[[[o1]]] option1";
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[1].displayName = "[[[o2]]] option2";

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
			});

			it("should give the code of the option as blank when there is no end delimiter", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[0].displayName = "[[[o1 option1";
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[1].displayName = "[[[o2 option2";

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "", label: "option1", type: "LABEL"},
						{code: "", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
			});

			it("should give the code of the option as the remaining part which is before the end delimiter in the label", function() {
				var currentTestProgram = _.cloneDeep(testProgram);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[0].displayName = "[o1]]] option1";
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[1].displayName = "o2]]] option2";

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
					id: "111",
					displayFormName: "de1",
					valueType: "INTEGER"
				};
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
					id: "112",
					displayFormName: "de2",
					valueType: "TEXT"
				};

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "[o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					]]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns[0][1].code).toEqual(actualPages[0].columns[0][1].code);
				expect(expectedPages[0].columns[0][2].code).toEqual(actualPages[0].columns[0][2].code);
			});
		});

		it("should get all those data elements whose display option is not NONE", function() {
			var currentTestProgram = _.cloneDeep(testProgram);

			var dataElement = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0];
			currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = _.cloneDeep(dataElement);
			currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1].attributeValues.value = config.customAttributes.displayOptionUID.options.none;

			var expectedPages = [{
				contents: [],
				type: 'CODESHEET',
				columns: [[
					{code: "Code", label: "dataElement", type: "HEADING"},
					{code: "o1", label: "option1", type: "LABEL"},
					{code: "o2", label: "option2", type: "LABEL"},
					{code: '', label: '', type: "GAP"}
				]]
			}];

			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages[0].columns[0]).toEqual(actualPages[0].columns[0]);
		});
	});

	describe("Process Columns", function() {

		it("should be able to identify number of rows that each column can hold", function() {
			var actualRows = codeSheetProcessor.getNumberOfRows();
			expect(5).toEqual(actualRows);
		});

		it("should add a gap element at the end of each option Set", function() {
			var currentTestProgram = _.cloneDeep(testProgram);

			var expectedPages = [{
				columns: [[
					{code: "Code", label: "dataElement", type: "HEADING"},
					{code: "o1", label: "option1", type: "LABEL"},
					{code: "o2", label: "option2", type: "LABEL"},
					{code: '', label: '', type: "GAP"}
				], null, null]
			}];
			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages[0].columns[0]).toEqual(actualPages[0].columns[0]);
		});

		it("should not add a gap element if it's the last element of a column", function() {
			var currentTestProgram = _.cloneDeep(testProgram);

			for(var i = 0; i < 4; i++) {
				var optionDisplayName = config.Delimiters.optionCodeStartDelimiter + "o" + (i + 1) + config.Delimiters.optionCodeEndDelimiter + "option" + (i + 1);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[i] = {
					id: i + 1,
					code: i + 1,
					displayName: optionDisplayName
				};
			}

			var expectedPages = [{
				columns: [[
					{code: "Code", label: "dataElement", type: "HEADING"},
					{code: "o1", label: "option1", type: "LABEL"},
					{code: "o2", label: "option2", type: "LABEL"},
					{code: "o3", label: "option3", type: "LABEL"},
					{code: "o4", label: "option4", type: "LABEL"}
				], null, null]
			}];

			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages[0].columns).toEqual(actualPages[0].columns);
		});

		it("should repeat data element heading in next column after breaking labels in previous column", function() {
			var currentTestProgram = _.cloneDeep(testProgram);
			for(var i = 0; i < 6; i++) {
				var optionDisplayName = config.Delimiters.optionCodeStartDelimiter + "o" + (i + 1) + config.Delimiters.optionCodeEndDelimiter + "option" + (i + 1);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[i] = {
					id: i + 1,
					code: i + 1,
					displayName: optionDisplayName
				};
			}

			var expectedPages = [{
				contents: [],
				type: 'CODESHEET',
				columns: [
					[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: "o3", label: "option3", type: "LABEL"},
						{code: "o4", label: "option4", type: "LABEL"}
					],
					[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o5", label: "option5", type: "LABEL"},
						{code: "o6", label: "option6", type: "LABEL"},
						{code: '', label: '', type: "GAP"}
					], null]
			}];

			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages[0].columns).toEqual(actualPages[0].columns);
		});

		describe("Handle Orphans", function() {

			it("should add options along with header to a new column if only one option fits in the previous column", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options = [{id: 1, code: 1, displayName: "[o1]option1"}];
				var dataElement = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = _.cloneDeep(dataElement);

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o1", label: "option1", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						],
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o1", label: "option1", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						], null]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns).toEqual(actualPages[0].columns);
			});
			it("should add last two options to the new column, if only one option is left to be added in the new column", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				for(var i = 0; i < 5; i++) {
					var optionDisplayName = config.Delimiters.optionCodeStartDelimiter + "o" + (i + 1) + config.Delimiters.optionCodeEndDelimiter + "option" + (i + 1);
					currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[i] = {
						id: i + 1,
						code: i + 1,
						displayName: optionDisplayName
					};
				}

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o1", label: "option1", type: "LABEL"},
							{code: "o2", label: "option2", type: "LABEL"},
							{code: "o3", label: "option3", type: "LABEL"}
						],
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o4", label: "option4", type: "LABEL"},
							{code: "o5", label: "option5", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						], null]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns).toEqual(actualPages[0].columns);
			});

			it("should not add a header element if it is the last element of a column", function() {
				var currentTestProgram = _.cloneDeep(testProgram);

				var dataElement = currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0];
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = _.cloneDeep(dataElement);

				var expectedPages = [{
					contents: [],
					type: 'CODESHEET',
					columns: [
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o1", label: "option1", type: "LABEL"},
							{code: "o2", label: "option2", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						],
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o1", label: "option1", type: "LABEL"},
							{code: "o2", label: "option2", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						], null]
				}];

				var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
				expect(expectedPages[0].columns).toEqual(actualPages[0].columns);
			});
		});
	});

	describe("Process Pages", function() {
		it("should get a new page when all columns of previous page are filled", function() {
			var currentTestProgram = _.cloneDeep(testProgram);

			for(var i = 0; i < 14; i++) {
				var optionDisplayName = config.Delimiters.optionCodeStartDelimiter + "o" + (i + 1) + config.Delimiters.optionCodeEndDelimiter + "option" + (i + 1);
				currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[0].options[i] = {
					id: i + 1,
					code: i + 1,
					displayName: optionDisplayName
				};
			}
			var expectedPages = [
				{
					contents: [],
					type: 'CODESHEET',
					heightLeft: 50,
					widthLeft: 183,
					columns: [[
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o1", label: "option1", type: "LABEL"},
						{code: "o2", label: "option2", type: "LABEL"},
						{code: "o3", label: "option3", type: "LABEL"},
						{code: "o4", label: "option4", type: "LABEL"}
					], [
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o5", label: "option5", type: "LABEL"},
						{code: "o6", label: "option6", type: "LABEL"},
						{code: "o7", label: "option7", type: "LABEL"},
						{code: "o8", label: "option8", type: "LABEL"}
					], [
						{code: "Code", label: "dataElement", type: "HEADING"},
						{code: "o9", label: "option9", type: "LABEL"},
						{code: "o10", label: "option10", type: "LABEL"},
						{code: "o11", label: "option11", type: "LABEL"},
						{code: "o12", label: "option12", type: "LABEL"}
					]],
					programName: "test program"
				},
				{
					contents: [],
					type: 'CODESHEET',
					heightLeft: 50,
					widthLeft: 183,
					columns: [
						[
							{code: "Code", label: "dataElement", type: "HEADING"},
							{code: "o13", label: "option13", type: "LABEL"},
							{code: "o14", label: "option14", type: "LABEL"},
							{code: '', label: '', type: "GAP"}
						], null, null],
					programName: "test program"
				}
			];

			var actualPages = clone(codeSheetProcessor.process(currentTestProgram));
			expect(expectedPages).toEqual(actualPages);
		});
	});
});