TallySheets.factory("Config", [function() {
	return {
		PageTypes: {
			A4: {
				Portrait: {
					availableHeight: 237,
					availableWidth: 183,
					graceHeight: 10
				},
				LandScape: {
					availableHeight: 175,
					availableWidth: 270
				}
			}
		},
		Register: {
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
			numberOfCOCColumns: 5
		},
		CodeSheet: {
			heightOfProgramTitle: 10,
			rowHeight: 6,
			numberOfColumns: 3
		},
		OptionSet: {
			labelPadding: 4,
			dataElementLabel: 48,
			optionsPadding: 12
		},
		Prefixes: {
			dataSetPrefix: {
				value:"tally_",
				translationKey:"DATASET_PREFIX"
			},
			programPrefix: {
				value:"perPt_",
				translationKey:"PROGRAM_PREFIX"
			}
		},
		CustomAttributes: {
			printFlagUID: {
				id: "F6S3pRyjnSf",
				associatedWith: ['dataSet', 'program']
			},
			displayOptionUID: {
				id: "Fth2lxGOF4M",
				associatedWith: ['dataElement'],
				options: {
					none: '0',
					text: '1',
					list: '2'
				}
			}
		}
	}
}]);