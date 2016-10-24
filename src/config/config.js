TallySheets.factory("Config", [function() {

	var config = {};

		config.PageTypes = {
			A4: {
				Portrait: {
					height:297,
					width:210,
					borderTop: 15,
					borderBottom: 15,
					borderLeft: 15,
					borderRight: 15,
					availableHeight: 237,
					availableWidth: 183,
					graceHeight: 10
				},
				LandScape: {
					availableHeight: 175,
					availableWidth: 270
				}
			}
		};
		config.Register = {
			availableHeight: 175,
			availableWidth: 270,
			labelHeight: 10,                 //table header
			tableHeaderHeight: 10,           //page header
			dataEntryRowHeight: 9,
			headerHeight: 25,
			textElementWidth: 50,
			otherElementWidth: 30
		};
		config.Coversheet = {
			heightOfDataElementInGeneralDataElement: 9,
			gapBetweenSections: 5,
			heightOfSectionTitle: 7,
			heightOfProgramTitle:10,
			graceHeight:10,
			availableHeight:237,
			availableWidth:183
		};
		config.DataSet = {
			heightOfTableHeader: 15,
			heightOfDataElementInCatCombTable: 12,
			heightOfDataElementInGeneralDataElement: 9,
			heightOfSectionTitle: 5,
			heightOfDataSetTitle: 5.5,
			gapBetweenSections: 3,
			headerHeight: 9,
			graceHeight: 5,
			availableHeight: 0,
			availableWidth: config.PageTypes.A4.widthAfterRemovingDefaultBorders,
			numberOfCOCColumns: 5
		};
		config.CodeSheet = {
			heightOfProgramTitle: 10,
			rowHeight: 6,
			numberOfColumns: 3
		};
		config.OptionSet = {
			labelPadding: 4,
			dataElementLabel: 48,
			optionsPadding: 12
		};
		config.Prefixes = {
			dataSetPrefix: {
				value:"tally_",
				translationKey:"DATASET_PREFIX"
			},
			programPrefix: {
				value:"perPt_",
				translationKey:"PROGRAM_PREFIX"
			}
		};
		config.CustomAttributes = {
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
		var updatePageA4withCalculatedValues = function(){
			config.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders = config.PageTypes.A4.Portrait.height - config.PageTypes.A4.Portrait.borderBottom - config.PageTypes.A4.Portrait.borderTop;
			config.PageTypes.A4.Portrait.widthAfterRemovingDefaultBorders = config.PageTypes.A4.Portrait.width - config.PageTypes.A4.Portrait.borderLeft - config.PageTypes.A4.Portrait.borderRight;
		};
		var updateDataSetWithCalculatedValues = function(){
		config.DataSet.availableHeight = config.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders - config.DataSet.headerHeight;
	};
	updatePageA4withCalculatedValues();
	updateDataSetWithCalculatedValues();
	return config;
}]);