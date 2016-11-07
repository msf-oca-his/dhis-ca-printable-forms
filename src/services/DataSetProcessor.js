TallySheets.service('DataSetProcessor', [ 'Config', 'DataSetPage', 'Content', 'ContentTypes', 'PrintFriendlyUtils', 'DefaultContent',
	'OptionSetContent', 'CatCombContent', 'DatasetTitle', function(config, DataSetPage, Content, ContentTypes, printFriendlyUtils, DefaultContent,
	                                               OptionSetContent, CatCombContent, DatasetTitle) {
// TallySheets.service('DataSetProcessor', ['CustomAttributeService', 'Config', 'DataSetPage', 'Content', 'PrintFriendlyUtils', function(CustomAttributeService, config, DataSetPage, Content, printFriendlyUtils) {
	var pages = [];
	var currentPageIndex;
	var page;

	var processDataSet = function(dataSet) {
		var processSection = function(section, sectionIndex) {

			var getHeightForSection = function(section) {
				var height;
				if(isCatCombSection(section))
					height = config.DataSet.heightOfDataElementInCatCombTable * (section.dataElements.length ) + config.DataSet.heightOfTableHeader + config.DataSet.gapBetweenSections;
				else if(isOptionSetSection(section))
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements[0].options.length / 3)) + config.DataSet.gapBetweenSections;
				else
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + config.DataSet.gapBetweenSections;

				return printFriendlyUtils.isDuplicateSection(sectionIndex, dataSet.sections) ? height : height + config.DataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(_.isEmpty(page.contents) || isFirstSection) page.contents.push(new Content(ContentTypes.datasetTitle, new DatasetTitle(dataSet.name)));
				// page.contents.push({type: 'section', section: section});


				var isDuplicate = printFriendlyUtils.isDuplicateSection(sectionIndex, dataSet.sections)
				if(isDuplicate) section.name = "";
				if(isCatCombSection(section))
					page.contents.push(new Content(ContentTypes.catComb, new CatCombContent(section)));
				else if(isOptionSetSection(section))
					page.contents.push(new Content(ContentTypes.optionSet, new OptionSetContent(section, 'dataElements')));
				else
					page.contents.push(new Content(ContentTypes.default, new DefaultContent(section, 'dataElements')));

				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
				page = new DataSetPage();
				pages[++currentPageIndex] = page;
				processSection(section, isFirstSectionInDataSet);
			};
			var getNumberOfOptionsThatCanFit = function(section){
				var overFlow = sectionHeight - page.heightLeft;
				return section.dataElements[0].options.length - Math.ceil(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
			};
			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(isCatCombSection(section)) {
					var numberOfOrphanDataElements = Math.ceil(overFlow / config.DataSet.heightOfDataElementInCatCombTable);
					var numberOfDataElements = section.dataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(isOptionSetSection(section))
					return section.dataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
				else
					return section.dataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
			};

			var breakAndAddSection = function(section, numberOfElementsThatCanFit) {
				if(isCatCombSection(section)) {
					var newSection = _.cloneDeep(section);
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					// newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInDataSet = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
				}
				else if(isOptionSetSection(section)) {
					var newSection = _.cloneDeep(section);
					var numberOfOptionsThatCanFit = getNumberOfOptionsThatCanFit(section);
					if(numberOfOptionsThatCanFit <= 3){
						addSectionToNewPage(section, getHeightForSection(section), false);
						return;
					}
					if(numberOfOptionsThatCanFit % 3 > 0)
						numberOfOptionsThatCanFit = numberOfOptionsThatCanFit + (3 - numberOfOptionsThatCanFit % 3);
					newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfOptionsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					// printFriendlyUtils.splitLeftAndRightElements(section, "dataElements");
					// printFriendlyUtils.splitLeftAndRightElements(newSection, "dataElements");
					// newSection.isDuplicate = true;
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
	};

	var isCatCombSection = function(section) {
		return !!section.dataElements[0] && !!section.dataElements[0].categoryCombo && section.dataElements[0].categoryCombo.name != "default"
	};
	var isOptionSetSection = function(section) {
		return section.dataElements[0] && section.dataElements[0].valueType == 'OPTIONSET';
	};
	this.process = function(dataSets) {
		pages = [];
		currentPageIndex = 0;
		_.map(dataSets, function(dataSet) {
			dataSet = _.cloneDeep(dataSet);
			for(var i = 0; i < dataSet.sections.length; i++) {
				dataSet.sections[i].dataElements = printFriendlyUtils.getDataElementsToDisplay(dataSet.sections[i], 'dataElements');
				if(isCatCombSection(dataSet.sections[i])) {
					printFriendlyUtils.divideCatCombsIfNecessary(dataSet.sections, i, "dataElements");
				}
				else {
					printFriendlyUtils.divideOptionSetsIntoNewSections(dataSet.sections, i, "dataElements");
				}
			}
			processDataSet(dataSet)
		});
		return pages;
	}
}]);