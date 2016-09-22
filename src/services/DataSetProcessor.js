TallySheets.service('DataSetProcessor', ['CustomAttributeService', 'Config', 'Page', 'Content', 'PrintFriendlyUtils', function(CustomAttributeService, config, Page, Content, printFriendlyUtils) {
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
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements[0].options.length / 3)) + config.DataSet.gapBetweenSections;
				else
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + config.DataSet.gapBetweenSections;

				return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
				page.contents.push({type: 'section', section: section});
				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
				page = new Page("DATASET");
				page.datasetName = dataSet.displayName;
				pages[++currentPageIndex] = page;
				section.isDuplicate = false;
				processSection(section, isFirstSectionInDataSet);
			};

			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(section.isCatComb) {
					var numberOfOrphanDataElements = Math.floor(overFlow / config.DataSet.heightOfDataElementInCatCombTable);
					var numberOfDataElements = section.dataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(section.isOptionSet)
					return section.dataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
				else
					return section.dataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
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
					if(numberOfElementsThatCanFit % 3 > 0)
						numberOfElementsThatCanFit = numberOfElementsThatCanFit + (3 - numberOfElementsThatCanFit % 3);
					newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfElementsThatCanFit);
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

			var sectionHeight = (sectionIndex == 0) ? getHeightForSection(section) + config.DataSet.heightOfDataSetTitle : getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0 || overflow < config.DataSet.graceHeight)
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section)
				if(numberOfElementsThatCanFit == section.dataElements.length){
					addSectionToPage(section, sectionHeight);}
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else {
					var isFirstSectionInDataSet = sectionIndex == 0;
					addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
				}
			}
		};

		if(!pages[currentPageIndex]) {
			page = new Page("DATASET");
			page.datasetName = dataSet.displayName;
			pages[currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}
		_.map(dataSet.sections, processSection);
		dataSet.isPrintFriendlyProcessed = true;
	};

	this.process = function(dataSet) {
		pages = [];
		currentPageIndex = 0;
		_.map([dataSet], function(dataSet) {
			for(var i = 0; i < dataSet.sections.length; i++) {
				if(dataSet.sections[i].isCatComb) {
					printFriendlyUtils.divideCatCombsIfNecessary(dataSet.sections, i, "dataElements");
					printFriendlyUtils.addLineBreakAfterEachCategoryOption(dataSet.sections[i], "dataElements");
				}
				else {
					dataSet.sections[i].dataElements = printFriendlyUtils.applyDisplayOptionsToDataElements(dataSet.sections[i], "dataElements");
					printFriendlyUtils.divideOptionSetsIntoNewSections(dataSet.sections, i, "dataElements");
					if(!dataSet.sections[i].isOptionSet)
						printFriendlyUtils.splitLeftAndRightElements(dataSet.sections[i], "dataElements");
				}
			}
			processDataSet(dataSet)
		});
		return pages;
	}
}]);