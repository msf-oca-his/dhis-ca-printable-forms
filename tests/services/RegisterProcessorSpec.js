describe('RegisterProcessor', function() {
	var registerProcessor, _DataElement;
	var httpMock;
	var $rootScope;
	var timeout;
	var p;
	var config = {
		Register: {
			availableHeight   : 175,
			availableWidth    : 270,
			labelHeight       : 10,                 //table header
			tableHeaderHeight : 10,           //page header
			dataEntryRowHeight: 9,
			headerHeight      : 25,
			textElementWidth  : 50,
			otherElementWidth : 30
		},

		OptionSet       : {
			labelPadding    : 4,
			dataElementLabel: 48,
			optionsPadding  : 12
		},
		DisplayOptions  : {
			none: '0',
			text: '1',
			list: '2'
		},
		CustomAttributes: {
			displayOptionUID: "111"
		}
	};

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function(RegisterProcessor, $httpBackend, $q, _$rootScope_, $timeout, DataElement) {
		registerProcessor = RegisterProcessor;
		p = $q;
		$rootScope = _$rootScope_;
		httpMock = $httpBackend;
		timeout = $timeout;
		_DataElement = DataElement
		httpMock.expectGET("i18n/en.json").respond(200, {});
	}));

	var testProgram = {
		    id           : "123",
		    name         : "test program",
		    programStages: [{
			    programStageSections: [{
				    programStageDataElements: [],
				    id                      : "134",
				    isCatComb               : false,
				    name                    : "section"
			    }]
		    }],
		    type         : 'program'
	    }
		;
	//TODO: test names should be named more accurate as they are the source of documentation for us
	it("should test register's page width and height and test the register which contains only comments data element", function() {
		var expectedPages = [{
			heightLeft : 150,
			widthLeft  : 220,
			contents   : [{
				data: [
					new _DataElement({ name: 'Comments', type: 'TEXT' })],
				type: { type: 'REGISTER_CONTENT', renderer: 'register-content' },
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
				name     : "dataElement",
				id       : "1234",
				valueType: "TEXT"
			};
		}

		var expectedPages = [{
			heightLeft: 0,
			widthLeft : 0,
			contents  : [{
				data: [
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
				],
				type: { renderer: 'register-content', type: 'REGISTER_CONTENT' }
			}]
		},
			{
				heightLeft: 30,
				widthLeft : 0,
				contents  : [{
					data: [
						{ name: "dataElement", id: "1234", valueType: "TEXT" },
						new _DataElement({ name: 'Comments', type: 'TEXT' })
					],
					type: { renderer: 'register-content', type: 'REGISTER_CONTENT' }
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
			name     : "dataElement",
			id       : "1234",
			valueType: "TEXT"

		};

		currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[1] = {
			name     : "dataElement",
			id       : "1234",
			valueType: "OPTIONSET"

		};

		currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[2] = {
			name     : "dataElement",
			id       : "1234",
			valueType: "OPTIONSET"

		};

		currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[3] = {
			name     : "dataElement",
			id       : "1234",
			valueType: "TEXT"

		};

		currentTestProgram.programStages[0].programStageSections[0].programStageDataElements[4] = {
			name     : "dataElement",
			id       : "1234",
			valueType: "TEXT"
		};

		var expectedPages = [{
			heightLeft : 0,
			widthLeft  : 0,
			contents   : [{
				data: [
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					{ name: "dataElement", id: "1234", valueType: "OPTIONSET" },
					{ name: "dataElement", id: "1234", valueType: "OPTIONSET" },
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					{ name: "dataElement", id: "1234", valueType: "TEXT" },
					new _DataElement({ name: 'Comments', valueType: 'TEXT' })],
				type: { renderer: 'register-content', type: 'REGISTER_CONTENT' }
			}
			],
			programName: 'test program',
		}];

		var actualPages = registerProcessor.process(testProgram, 'REGISTER');
		expect(clone(expectedPages[0].contents)).toEqual(clone(actualPages[0].contents))
	})
});
