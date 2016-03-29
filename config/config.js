TallySheets.factory("Config", [function () {
    return {
        Register:{
            availableHeight: 175,
            availableWidth: 270,
            labelHeight: 20,            //table header
            tableHeaderHeight: 10,           //page header
            dataEntryRowHeight: 10,
            headerHeight: 25,
            textElementWidth: 50,
            otherElementWidth: 30
        },
        DataSet:{
            heightOfTableHeader : 15,
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
        OptionSet:{
            labelPadding: 4,
            dataElementLabel: 48 ,
            optionsPadding:12
        }
    }
}]);