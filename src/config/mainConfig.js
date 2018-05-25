TallySheets.factory('Config', [function() {
	
	var config = {};

	config.A4 = {
		LandScape: "src/layouts/A4.landscape.json",
		Portrait: "src/layouts/A4.portrait.json"
	};
	
	config.A3 = {
		LandScape:"",
		Portrait:""
	};

	config.OptionSet = {
		dataElementLabelWidth: 44,
		numberOfColumns: 3,
		heightOfOption: 9,	//do not edit this value and the below one. They should be same until we start supporting different values
		dataElementLabelHeight: 9
	};

	config.Register = {
		tableHeaderHeight: 10,
		dataEntryRowHeight: 9,
		pageHeaderHeight: 25,
		defaultColumnWidth: 30,
		widthOfSNOColumn: 10
	};

	config.CodeSheet = {
		heightOfProgramTitle: 10,
		rowHeight: 8,
		numberOfColumns: 3,
		pageNumberHeight: 10,
		widthOfCode: 20
	};
	
	config.Metrics = {
		mm: "mm"
	};
	
	config.Prefixes = {
		dataSetPrefix: {
			value: "tally_",
			translationKey: "dataset_prefix"
		},
		programPrefix: {
			value: "perPt_",
			translationKey: "program_prefix"
		}
	};
	config.Delimiters = {
		optionCodeStartDelimiter: "[",
		optionCodeEndDelimiter: "]",
		categoryOptionComboDelimiter: "<br>"
	};
	config.customAttributes = {
		printFlagUID: {
			id: "c0ZXZFHlWTn",
			associatedWith: ['dataSet', 'program']
		},
		displayOptionUID: {
			id: "kWsPSyYxPsW",
			associatedWith: ['dataElement'],
			options: {
				none: '0',
				text: '1',
				list: '2'
			}
		},
		columnWidthOptionUID: {
			id: "wSbFx381Jxw",
			associatedWith: ['dataElement'],
			columnWidthOptions: {
				standard: {
					code: "10",
					width: config.Register.defaultColumnWidth
				},
				wide: {
					code: "11",
					width: 50
				},
				narrow: {
					code: "12",
					width: 15
				},
				extra_wide: {
					code: "13",
					width: 80
				}
			}
		},
		hideInCodeSheet: {
			id:'CfFqDw7iYNY',
			associatedWith:['dataElement']
		}
	};
	
	config.showUserRelatedFormsOnly = true;

	return config;
}]);