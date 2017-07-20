TallySheets.factory('Config', ['CalculatedConfig', function(CalculatedConfig) {

	var config = {};

	config.PageTypes = {
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
			},
			LandScape: {
				availableHeight: 175,
				availableWidth: 270
			}
		}
	};
	config.Register = {
		tableHeaderHeight: 10,
		dataEntryRowHeight: 9,
		pageHeaderHeight: 25,
		defaultColumnWidth: 30
	};
	config.Coversheet = {
		defaultHeightOfDataElementLabel: 9,
		gapBetweenSections: 5,
		heightOfSectionTitle: 7,
		heightOfProgramTitle: 10,
		commentsHeight: 30
	};
	config.DataSet = {
		heightOfCatCombTableHeader: 15,
		heightOfDataElementInCatCombTable: 12,
		defaultHeightOfDataElementLabel: 9, //TODO: change the name as per others in the list - this one is odd one out
		gapBetweenColumnsInDefaultRendering: 10,
		heightOfSectionTitle: 5,
		heightOfDataSetTitle: 5.5,
		gapBetweenSections: 3,
		pageHeaderHeight: 9,
		numberOfCOCColumns: 5,
		widthOfCategoryOptionCombo: 30,
		widthOfDataElement: 40,
		numberOfColumnsInDefaultRendering: 2 //TODO: app can only render 2, do not change this until its supported.
	};
	config.CodeSheet = {
		heightOfProgramTitle: 10,
		rowHeight: 6,
		numberOfColumns: 3,
		pageNumberHeight: 10
	};
	config.OptionSet = {
		dataElementLabelWidth: 44,
		numberOfColumns: 3,
		heightOfOption: 9,	//do not edit this value and the below one. They should be same until we start supporting different values
    dataElementLabelHeight: 9
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
		}
	};
	config.showUserRelatedFormsOnly = true;
	return CalculatedConfig.getConfig(config);
}]);
