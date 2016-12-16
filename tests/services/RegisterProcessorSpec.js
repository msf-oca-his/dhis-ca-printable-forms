describe('RegisterProcessor', function() {
	var registerProcessor, _DataElement;
	var config = {
		PageTypes: {
			A4: {
				LandScape: {
					availableHeight: 175,
					availableWidth: 270
				}
			}
		},
		Register: {
			tableHeaderHeight: 10,
			dataEntryRowHeight: 9,
			pageHeaderHeight: 25,
			textElementWidth: 50,
			otherElementWidth: 30
		},
		OptionSet: {
			labelPadding: 4,
			dataElementLabel: 48,
			optionsPadding: 12
		},
		DisplayOptions: {
			none: '0',
			text: '1',
			list: '2'
		},
		customAttributes: {
			displayOptionUID: "111"
		}
	};

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
		});

		inject(function(RegisterProcessor, DataElement) {
			registerProcessor = RegisterProcessor;
			_DataElement = DataElement;
		})
	});

	var testProgram = {
		    id: "123",
		    name: "test program",
		    displayName: "test program",
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
	//TODO: test names should be named more accurate as they are the source of documentation for us
	it("should test register's page width and height and test the register which contains only comments data element", function() {
		var expectedPages = [{
			heightLeft: 150,
			widthLeft: 220,
			type: 'REGISTER',
			contents: [{
				data: [
					new _DataElement({displayName: 'Comments', type: 'TEXT'})],
				type: {type: 'REGISTER_CONTENT', renderer: 'register-content'}
			}],
			programName: 'test program'
		}];

		var actualPages = registerProcessor.process(testProgram, 'REGISTER');
		expect(clone(expectedPages[0])).toEqual(clone(actualPages[0]))
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
			contents: [{
				data: [
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					{name: "dataElement", id: "1234", valueType: "TEXT"},
				],
				type: {renderer: 'register-content', type: 'REGISTER_CONTENT'}
			}]
		},
			{
				heightLeft: 30,
				widthLeft: 0,
				contents: [{
					data: [
						{name: "dataElement", id: "1234", valueType: "TEXT"},
						new _DataElement({displayName: 'Comments', type: 'TEXT'})
					],
					type: {renderer: 'register-content', type: 'REGISTER_CONTENT'}
				}]
			}
		];

		var actualPages = registerProcessor.process(testProgram, 'REGISTER');
		expect(clone(expectedPages[0].contents)).toEqual(clone(actualPages[0].contents))
		expect(clone(expectedPages[1].contents)).toEqual(clone(actualPages[1].contents))
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
			contents: [{
				data: [
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					{name: "dataElement", id: "1234", valueType: "OPTIONSET"},
					{name: "dataElement", id: "1234", valueType: "OPTIONSET"},
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					{name: "dataElement", id: "1234", valueType: "TEXT"},
					new _DataElement({displayName: 'Comments', valueType: 'TEXT'})],
				type: {renderer: 'register-content', type: 'REGISTER_CONTENT'}
			}
			],
			programName: 'test program'
		}];

		var actualPages = registerProcessor.process(testProgram, 'REGISTER');
		expect(clone(expectedPages[0].contents)).toEqual(clone(actualPages[0].contents))
	})
});
