TallySheets.service('DataSetProcessor', ['CustomAttributeService', 'Config', 'DataSetPage', 'Content', 'PrintFriendlyUtils', 'CommonUtils', function(CustomAttributeService, config, DataSetPage, Content, printFriendlyUtils, commonUtils) {
	var pages = [];
	var currentPageIndex;
	var page;

	var processDataSet = function(dataSet) {
		var processSection = function(section, sectionIndex) {

			var getHeightForSection = function(section) {
				var height;
				if(section.isCatComb)
					height = config.DataSet.heightOfDataElementInCatCombTable * (section.dataElements.length ) + config.DataSet.heightOfTableHeader + config.DataSet.gapBetweenSections;
				else if(section.isOptionSet)
					height = config.DataSet.defaultHeightOfDataElementLabel * (Math.ceil(section.dataElements[0].options.length / 3)) + config.DataSet.gapBetweenSections;
				else
					height = config.DataSet.defaultHeightOfDataElementLabel * (Math.ceil(section.dataElements.length / 2)) + config.DataSet.gapBetweenSections;

				return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(_.isEmpty(page.contents) || isFirstSection) page.contents.push({type: 'dataSetName', name: dataSet.name});
				page.contents.push({type: 'section', section: section});
				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
				page = new DataSetPage();
				pages[++currentPageIndex] = page;
				section.isDuplicate = false;
				processSection(section, isFirstSectionInDataSet);
			};
			var getNumberOfOptionsThatCanFit = function(section){
				var overFlow = sectionHeight - page.heightLeft;
				return section.dataElements[0].options.length - Math.ceil(overFlow * 3 / (config.DataSet.defaultHeightOfDataElementLabel));
			};
			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(section.isCatComb) {
					var numberOfOrphanDataElements = Math.ceil(overFlow / config.DataSet.heightOfDataElementInCatCombTable);
					var numberOfDataElements = section.dataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(section.isOptionSet)
					return 0;
				else
					return section.dataElements.length - Math.round(overFlow * 2 / (config.DataSet.defaultHeightOfDataElementLabel));
			};

			var breakAndAddSection = function(section, numberOfElementsThatCanFit) {
				if(section.isCatComb) {
					var newSection = _.cloneDeep(section);
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					newSection.isDuplicate = true;
					printFriendlyUtils.addLineBreakAfterEachCategoryOption(newSection, "dataElements");
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInDataSet = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
				}
				else if(section.isOptionSet) {
					var newSection = _.cloneDeep(section);
					var numberOfOptionsThatCanFit = getNumberOfOptionsThatCanFit(section);
					if(numberOfOptionsThatCanFit <= 3){
						addSectionToNewPage(section, getHeightForSection(section), false);
						return;
					}
					if((section.dataElements[0].options.length - numberOfOptionsThatCanFit) < 3) {
						addSectionToPage(section, page.heightLeft);
						return;
					}
					if(numberOfOptionsThatCanFit % 3 > 0)
						numberOfOptionsThatCanFit = numberOfOptionsThatCanFit + (3 - numberOfOptionsThatCanFit % 3);
					newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfOptionsThatCanFit);
					printFriendlyUtils.createOptionSetSection(section, "dataElements");
					printFriendlyUtils.createOptionSetSection(newSection, "dataElements");
					newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					printFriendlyUtils.splitLeftAndRightElements(section, "dataElements");
					printFriendlyUtils.splitLeftAndRightElements(newSection, "dataElements");
					newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInDataSet = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
				}
			};

			var sectionHeight = (sectionIndex == 0 || (page.contents.length == 0)) ? getHeightForSection(section) + config.DataSet.heightOfDataSetTitle : getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0 )
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section)
				if(numberOfElementsThatCanFit == section.dataElements.length){
					addSectionToPage(section, sectionHeight);}
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else if (section.isOptionSet)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else {
					var isFirstSectionInDataSet = sectionIndex == 0;
					addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
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
		dataSet.isPrintFriendlyProcessed = true;
	};

	this.process = function(dataSets) {
		pages = [];
		currentPageIndex = 0;
		_.map(dataSets, function(dataSet) {
			dataSet = _.cloneDeep(dataSet);
			for(var i = 0; i < dataSet.sections.length; i++) {
				if(dataSet.sections[i].isCatComb) {
					printFriendlyUtils.divideCatCombsIfNecessary(dataSet.sections, i, "dataElements");
					printFriendlyUtils.addLineBreakAfterEachCategoryOption(dataSet.sections[i], "dataElements");
				}
				else {
					dataSet.sections[i].dataElements = printFriendlyUtils.applyDisplayOptionsToDataElements(dataSet.sections[i], "dataElements");
					printFriendlyUtils.divideOptionSetsIntoNewSections(dataSet.sections, i, "dataElements");
					_.map(dataSet.sections[i].dataElements, function(dataElement) {
						_.map(dataElement.options, function(option) {
							option.displayName = commonUtils.getRightPartOfSplit(option.displayName, config.Delimiters.OptionLabelDelimiter);  //TODO: Use PFF-model for transformation
						});
					});
					if(!dataSet.sections[i].isOptionSet)
						printFriendlyUtils.splitLeftAndRightElements(dataSet.sections[i], "dataElements");
				}
			}
			processDataSet(dataSet)
		});
		return pages;
	}
}]);