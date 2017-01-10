describe('RegisterProcessor', function() {
	var registerProcessor, _DataElement,RegisterColumn;
	var mockPrintFriendlyUtils = {};
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
			defaultColumnWidth:60
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
			displayOptionUID: "111",
			columnWidthOptionUID: {
				id: "1",
				associatedWith: ['dataElement'],
				columnWidthOptions: {
					narrow: {
						code: "12",
						width: 30
					},
					standard:{
						code: "10",
						width: 60
					},
					wide:{
						code: "11",
						width: 60
					},
					extra_wide: {
						code: "13",
						width: 70
					}
				}
			}
		}
	};

	beforeEach(function() {

		angular.module('d2HeaderBar', []);
		module("TallySheets");

		mockPrintFriendlyUtils.getDataElementsToDisplay = function(data) {
			return data;
		};

		mockPrintFriendlyUtils.getCustomAttribute = function(data, config) {
			return data[0];
		};

		module(function($provide) {
			$provide.value('Config', config);
			$provide.value('PrintFriendlyUtils', mockPrintFriendlyUtils);
		});

		inject(function(RegisterProcessor, DataElement, _RegisterColumn_) {
			registerProcessor = RegisterProcessor;
			_DataElement = DataElement;
			RegisterColumn = _RegisterColumn_;
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
			widthLeft: 270,
			type: 'REGISTER',
			contents: [{
				data: [
					new RegisterColumn('Comments', {code:'', width:config.Register.defaultColumnWidth})],
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
				displayName: "dataElement",
				id: "1234",
				valueType: "TEXT",
				attributeValues:[{
					attribute:{
						id:'1'
					},
					value:'10'
				}]
			};
		}

		var defaultRenderType = config.customAttributes.columnWidthOptionUID.columnWidthOptions.standard;

		var expectedPages = [{
			heightLeft: 0,
			widthLeft: 0,
			contents: [{
				data: [
					{name: "dataElement", renderType: defaultRenderType },
					{name: "dataElement", renderType:defaultRenderType },
					{name: "dataElement", renderType:defaultRenderType }
				],
				type: {renderer: 'register-content', type: 'REGISTER_CONTENT'}
			}]
		},
			{
				heightLeft: 30,
				widthLeft: 0,
				contents: [{
					data: [
						{name: "dataElement", renderType: defaultRenderType },
						{name: "dataElement", renderType: defaultRenderType },
						new RegisterColumn('Comments',{code:'',width:config.Register.defaultColumnWidth})
					],
					type: {renderer: 'register-content', type: 'REGISTER_CONTENT'}
				}]
			}
		];

		var actualPages = registerProcessor.process(currentTestProgram, 'REGISTER');
		expect(clone(expectedPages[0].contents)).toEqual(clone(actualPages[0].contents))
		expect(clone(expectedPages[1].contents)).toEqual(clone(actualPages[1].contents))
	});
});
