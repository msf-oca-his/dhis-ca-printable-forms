TallySheets.factory("Config", [function() {
	return {
		Register: {
			availableHeight: 175,
			availableWidth: 270,
			labelHeight: 10,                 //table header
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
		DisplayOptions: {
			none: '0',
			text: '1',
			list: '2'
		},
		CustomAttributes: {
			displayOptionUID: "Fth2lxGOF4M",
			printFlagUID: "F6S3pRyjnSf"
		}
	}
}]);