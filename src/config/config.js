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
		defaultColumnWidth:30
	};
	config.Coversheet = {
		defaultHeightOfDataElementLabel: 9,
		gapBetweenSections: 5,
		heightOfSectionTitle: 7,
		heightOfProgramTitle: 10,
		commentsHeight: 30
	};
	config.DataSet = {
		heightOfTableHeader: 15,
		heightOfDataElementInCatCombTable: 12,
		defaultHeightOfDataElementLabel: 9,
		heightOfSectionTitle: 5,
		heightOfDataSetTitle: 5.5,
		gapBetweenSections: 3,
		pageHeaderHeight: 9,
		numberOfCOCColumns: 5,
		widthOfCategoryOptionCombo: 30,
		widthOfDataElement: 40
	};
	config.CodeSheet = {
		heightOfProgramTitle: 10,
		rowHeight: 6,
		numberOfColumns: 3,
		pageNumberHeight: 10
	};
	config.OptionSet = {
		labelPadding: 4,
		dataElementLabel: 48,
		numberOfColumns: 3
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
		optionLabelDelimiter: "]",
		categoryOptionComboDelimiter: "<br>"
	};
	config.customAttributes = {
		// printFlagUID: {
		// 	id: "F6S3pRyjnSf",
		// 	associatedWith: ['dataSet', 'program']
		// },
		// displayOptionUID: {
		// 	id: "Fth2lxGOF4M",
		// 	associatedWith: ['dataElement'],
		// 	options: {
		// 		none: '0',
		// 		text: '1',
		// 		list: '2'
		// 	}
		// }
	};
	return CalculatedConfig.getConfig(config);
}]);