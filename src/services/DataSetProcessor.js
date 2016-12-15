TallySheets.service('DataSetProcessor', [ 'Config', 'DataSetPage', 'Content', 'ContentTypes', 'PrintFriendlyUtils', 'DefaultContent',
	'OptionSetContent', 'CatCombContent', 'DatasetTitle', function(config, DataSetPage, Content, ContentTypes, printFriendlyUtils,DefaultContent,
	                                               OptionSetContent, CatCombContent, DatasetTitle) {
	var pages = [];
	var currentPageIndex;
	var page;
	var noOfDefaultTypeColumns = 2;
	var configDataSet = config.DataSet;
	var optionSetNumberOfColumns = config.OptionSet.numberOfColumns;

	var processDataSet = function(dataSet) {
		var processSection = function(section, sectionIndex) {

			var getHeightForSection = function(section) {
				var height;
				if(isCatCombSection(section))
					height = configDataSet.heightOfDataElementInCatCombTable * (section.dataElements.length ) + configDataSet.heightOfTableHeader + configDataSet.gapBetweenSections;
				else if(printFriendlyUtils.isOptionSetSection(section, 'dataElements'))
					{
						height = configDataSet.defaultHeightOfDataElementLabel * (Math.ceil(section.dataElements[0].options.length / optionSetNumberOfColumns)) + configDataSet.gapBetweenSections;
					}
				else
					height = configDataSet.defaultHeightOfDataElementLabel * (Math.ceil(section.dataElements.length / noOfDefaultTypeColumns)) + configDataSet.gapBetweenSections;
				return printFriendlyUtils.isDuplicateSection(sectionIndex, dataSet.sections) ? height : height + configDataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(_.isEmpty(page.contents) || isFirstSection) page.contents.push(new Content(ContentTypes.datasetTitle, new DatasetTitle(dataSet.displayName)));
				var isDuplicate = printFriendlyUtils.isDuplicateSection(sectionIndex, dataSet.sections);
				if(isDuplicate) section.displayName = "";
				if(isCatCombSection(section))
					page.contents.push(new Content(ContentTypes.catComb, new CatCombContent(section)));
				else if(printFriendlyUtils.isOptionSetSection(section, 'dataElements'))
					page.contents.push(new Content(ContentTypes.optionSet, new OptionSetContent(section, 'dataElements')));
				else
					page.contents.push(new Content(ContentTypes.default, new DefaultContent(section, 'dataElements')));

				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section) {
				page = new DataSetPage();
				pages[++currentPageIndex] = page;
				sectionIndex = 0;
				processSection(section, sectionIndex);
			};
			var getNumberOfOptionsThatCanFit = function(section){
				var overFlow = sectionHeight - page.heightLeft;
				return section.dataElements[0].options.length - Math.ceil(overFlow * optionSetNumberOfColumns / (configDataSet.defaultHeightOfDataElementLabel));
			};
			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(isCatCombSection(section)) {
					var numberOfOrphanDataElements = Math.ceil(overFlow / configDataSet.heightOfDataElementInCatCombTable);
					var numberOfDataElements = section.dataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(printFriendlyUtils.isOptionSetSection(section, 'dataElements'))
					return section.dataElements[0].options.length - Math.round(overFlow * optionSetNumberOfColumns / (configDataSet.defaultHeightOfDataElementLabel));
				else
					return section.dataElements.length - Math.round(overFlow * noOfDefaultTypeColumns / (configDataSet.defaultHeightOfDataElementLabel));
			};

			var breakAndAddSection = function(section, numberOfElementsThatCanFit) {
				if(isCatCombSection(section)) {
					var newSection = _.cloneDeep(section);
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection);
				}
				else if(printFriendlyUtils.isOptionSetSection(section, 'dataElements')) {
					var newSection = _.cloneDeep(section);
					var numberOfOptionsThatCanFit = getNumberOfOptionsThatCanFit(section);
					if(numberOfOptionsThatCanFit <= optionSetNumberOfColumns){
						addSectionToNewPage(section);
						return;
					}
					if(numberOfOptionsThatCanFit % optionSetNumberOfColumns > 0)
						numberOfOptionsThatCanFit = numberOfOptionsThatCanFit + (optionSetNumberOfColumns - numberOfOptionsThatCanFit % optionSetNumberOfColumns);
					newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfOptionsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % noOfDefaultTypeColumns == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection);
				}
			};

			var sectionHeight = (sectionIndex == 0 || (page.contents.length == 0)) ? getHeightForSection(section) + configDataSet.heightOfDataSetTitle : getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0)
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section);
				if(numberOfElementsThatCanFit == section.dataElements.length){
					addSectionToPage(section, sectionHeight);}
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else if (printFriendlyUtils.isOptionSetSection(section, 'dataElements'))
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else {
					addSectionToNewPage(section)
				}
			}
		};

		if(!pages[currentPageIndex]) {
			page = new DataSetPage();
			page.datasetName = dataSet.displayName;
			pages[currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}
		_.map(dataSet.sections, processSection);
	};

	var isCatCombSection = function(section) {
		return !!section.dataElements[0] && !!section.dataElements[0].categoryCombo && section.dataElements[0].categoryCombo.name != "default"
	};
	this.process = function(dataSets) {
		pages = [];
		currentPageIndex = 0;
		_.map(dataSets, function(dataSet) {
			dataSet = _.cloneDeep(dataSet);
			for(var sectionIndex = 0; sectionIndex < dataSet.sections.length; sectionIndex++) {
				dataSet.sections[sectionIndex].dataElements = printFriendlyUtils.getDataElementsToDisplay(dataSet.sections[sectionIndex], 'dataElements');
				if(isCatCombSection(dataSet.sections[sectionIndex])) {
					printFriendlyUtils.divideCatCombsIfNecessary(dataSet.sections, sectionIndex, "dataElements");
				}
				else {
					printFriendlyUtils.divideOptionSetsIntoNewSections(dataSet.sections, sectionIndex, "dataElements");
				}
			}
			processDataSet(dataSet)
		});
		return pages;
	}
}]);