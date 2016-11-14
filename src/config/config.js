TallySheets.factory("Config", [ function() {

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
					widthAfterRemovingDefaultBorders: 'will be calculated',
					heightAfterRemovingDefaultBorders: 'will be calculated',
					graceHeight: 10
				},
				LandScape: {
					availableHeight: 175,
					availableWidth: 270
				}
			}
		};
		config.Register = {
			labelHeight: 10,                 //table header
			dataEntryRowHeight: 9,
			headerHeight: 25,
			textElementWidth: 50,
			otherElementWidth: 30
		};
		config.Coversheet = {
			defaultHeightOfDataElementLabel: 9,
			gapBetweenSections: 5,
			heightOfSectionTitle: 7,
			heightOfProgramTitle:10,
			graceHeight:10,
			availableHeight:237,
			availableWidth:183
		};
		config.DataSet = {
			defaultHeightOfDataElementLabel: 9,
			heightOfTableHeader: 15,
			heightOfDataElementInCatCombTable: 12,
			heightOfSectionTitle: 5,
			heightOfDataSetTitle: 5.5,
			gapBetweenSections: 3,
			headerHeight: 9,
			graceHeight: 5,
			availableHeight: 'will be calculated',
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
			numberOfColumns: 3
		};
		config.Prefixes = {
			dataSetPrefix: {
				value:"tally_",
				translationKey:"dataset_prefix"
			},
			programPrefix: {
				value:"perPt_",
				translationKey:"program_prefix"
			}
		};
		config.Delimiters = {
			optionLabelDelimiter: "]",
			categoryOptionComboDelimiter: "<br>"
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
			config.DataSet.availableWidth = config.PageTypes.A4.Portrait.widthAfterRemovingDefaultBorders;
		};
	updatePageA4withCalculatedValues();
	updateDataSetWithCalculatedValues();
	return config;
}]);