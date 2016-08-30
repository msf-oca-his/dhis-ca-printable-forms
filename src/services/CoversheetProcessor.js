TallySheets.service('CoversheetProcessor', ['DataElement', 'DataSetSection', 'Config', 'Content', 'Page', 'PrintFriendlyUtils', function(DataElement, DataSetSection, config, Content, Page, printFriendlyUtils) {
	var pages = [];
	var currentPageIndex;
	var page, currentProgram;

	var processSection = function(section, sectionIndex) {
		var getHeightForSection = function(section) {
			var height;
			if(section.isOptionSet)
				height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements[0].rows.length)) + config.DataSet.gapBetweenSections;
			else
				height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements.length / 2)) + config.DataSet.gapBetweenSections;

			return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
		};

		var addSectionToPage = function(section, height) {
			var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
			if(isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'programName', name: currentProgram.name});
			page.contents.push({type: 'section', section: section});
			page.heightLeft = page.heightLeft - height;
		};

		var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
			page = new Page("COVERSHEET");
			page.programName = currentProgram.name;
			pages[++currentPageIndex] = page;
			section.isDuplicate = false;
			processSection(section, isFirstSectionInDataSet);
		};

		var getNumberOfElementsThatCanFit = function(section) {
			var overFlow = sectionHeight - page.heightLeft;
			if(section.isOptionSet)
				return section.programStageDataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
			else
				return section.programStageDataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
		};

		var breakAndAddSection = function(section) {
			if(section.isOptionSet) {
				var newSection = _.cloneDeep(section);
				if(numberOfElementsThatCanFit % 3 > 0)
					numberOfElementsThatCanFit = numberOfElementsThatCanFit + (3 - numberOfElementsThatCanFit % 3);
				newSection.programStageDataElements[0].options = section.programStageDataElements[0].options.splice(numberOfElementsThatCanFit);
				printFriendlyUtils.createOptionSetSection(section, "programStageDataElements");
				printFriendlyUtils.createOptionSetSection(newSection, "programStageDataElements");
				newSection.isDuplicate = true;
				addSectionToPage(section, page.heightLeft);
				addSectionToNewPage(newSection, getHeightForSection(newSection), false);
			}
			else {
				var newSection = _.cloneDeep(section);
				(numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
				newSection.programStageDataElements = section.programStageDataElements.splice(numberOfElementsThatCanFit);
				printFriendlyUtils.splitLeftAndRightElements(section, "programStageDataElements");
				printFriendlyUtils.splitLeftAndRightElements(newSection, "programStageDataElements");
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
			var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section);

			if(numberOfElementsThatCanFit == section.programStageDataElements.length)
				addSectionToPage(section, sectionHeight);
			else if(numberOfElementsThatCanFit > 1)
				breakAndAddSection(section);
			else {
				var isFirstSectionInDataSet = (sectionIndex == 0);
				addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
			}
		}
	};

	var processProgram = function(program) {

		var addComments = function() {
			var lastPage = pages[pages.length - 1];
			if(lastPage.heightLeft > 30)
				lastPage.contents.push({ type: 'comments' });
			else {
				var newPage = new Page("COVERSHEET");
				newPage.contents.push({ type: 'comments' });
				pages.push(newPage);
			}

		};

		if(!pages[currentPageIndex]) {
			page = new Page("COVERSHEET");
			page.programName = program.name;
			pages[++currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}
		currentProgram = program;

		_.map(program.programStages[0].programStageSections, processSection);
		addComments();
		program.isPrintFriendlyProcessed = true;
	};

	this.process = function(program) {
		pages = [];
		currentPageIndex = -1;
		_.map([program], function(Program) {
			if(Program.programStages.length == 0) return;
			for(var i = 0; i < Program.programStages[0].programStageSections.length; i++) {
				if(Program.programStages[0].programStageSections.length == 0) return;
				Program.programStages[0].programStageSections[i].programStageDataElements = printFriendlyUtils.applyDisplayOptionsToDataElements(Program.programStages[0].programStageSections[i], "programStageDataElements");
				printFriendlyUtils.divideOptionSetsIntoNewSections(Program.programStages[0].programStageSections, i, "programStageDataElements");
				if(!Program.programStages[0].programStageSections[i].isOptionSet)
					printFriendlyUtils.splitLeftAndRightElements(Program.programStages[0].programStageSections[i], "programStageDataElements");
			}
			processProgram(Program)
		});
		return pages;
	}
}]);