TallySheets.service('CoversheetProcessor', [ 'Config', 'Content', 'ContentTypes', 'DefaultContent', 'OptionSetContent', 'CoverSheetPage', 'PrintFriendlyUtils',
	function(config, Content, ContentTypes, DefaultContent, OptionSetContent, CoverSheetPage, printFriendlyUtils) {
	var pages = [];
	var currentPageIndex;
	var page;
	var noOfDefaultTypeColumns = 2;


	var processProgram = function(program) {

		var processSection = function(section, sectionIndex) {
			var getHeightForSection = function(section) {
				var height;
				if(section.isOptionSet)
					height = config.Coversheet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements[0].rows.length)) + config.Coversheet.gapBetweenSections;
				else
					height = config.Coversheet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements.length / noOfDefaultTypeColumns)) + config.Coversheet.gapBetweenSections;

				return section.isDuplicate ? height : height + config.Coversheet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isDuplicate = printFriendlyUtils.isDuplicateSection(sectionIndex, program.programStages[0].programStageSections)
				if(isDuplicate) section.name = "";
				else if(isOptionSetSection(section))
					page.contents.push(new Content(ContentTypes.optionSet, new OptionSetContent(section, 'programStageDataElements')));
				else
					page.contents.push(new Content(ContentTypes.default, new DefaultContent(section, 'programStageDataElements')));

				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInProgram) {
				page = new CoverSheetPage();
				page.programName = program.displayName;
				pages[++currentPageIndex] = page;
				processSection(section, isFirstSectionInProgram);
			};

			var getNumberOfOptionsThatCanFit = function(section){
				var overFlow = sectionHeight - page.heightLeft;
				return section.programStageDataElements[0].options.length - Math.ceil(overFlow * config.OptionSet.numberOfColumns / (config.Coversheet.heightOfDataElementInGeneralDataElement));
			};

			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(section.isOptionSet)
					return section.programStageDataElements[0].options.length - Math.round(overFlow * config.OptionSet.numberOfColumns / (config.Coversheet.defaultHeightOfDataElementLabel));
				else
					return section.programStageDataElements.length - Math.round(overFlow * noOfDefaultTypeColumns / (config.Coversheet.defaultHeightOfDataElementLabel));
			};

			var breakAndAddSection = function(section) {
				if(isOptionSetSection(section)) {
					var newSection = _.cloneDeep(section);
					var numberOfOptionsThatCanFit = getNumberOfOptionsThatCanFit(section);
					if(numberOfOptionsThatCanFit <= config.OptionSet.numberOfColumns){
						addSectionToNewPage(section, getHeightForSection(section), false);
						return
					}
					if(numberOfOptionsThatCanFit % config.OptionSet.numberOfColumns > 0)
						numberOfOptionsThatCanFit = numberOfOptionsThatCanFit + (config.OptionSet.numberOfColumns - numberOfOptionsThatCanFit % config.OptionSet.numberOfColumns);
					newSection.programStageDataElements[0].options = section.programStageDataElements[0].options.splice(numberOfOptionsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % noOfDefaultTypeColumns == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.programStageDataElements = section.programStageDataElements.splice(numberOfElementsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInProgram = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInProgram);
				}
			};

			var sectionHeight = (sectionIndex == 0) ? getHeightForSection(section) + config.Coversheet.heightOfProgramTitle : getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0)
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section);
				if(numberOfElementsThatCanFit == section.programStageDataElements.length)
					addSectionToPage(section, sectionHeight);
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else if (section.isOptionSet)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else {
					var isFirstSectionInProgram = (sectionIndex == 0);
					addSectionToNewPage(section, sectionHeight, isFirstSectionInProgram)
				}
			}
		};

		var addComments = function() {
			var lastPage = pages[pages.length - 1];
			if(lastPage.heightLeft > config.Coversheet.commentsHeight)
				lastPage.contents.push({ type: 'comments' });
			else {
				var newPage = new CoverSheetPage("COVERSHEET");
				newPage.contents.push({ type: 'comments' });
				pages.push(newPage);
			}

		};

		if(!pages[currentPageIndex]) {
			page = new CoverSheetPage("COVERSHEET");
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}

		_.map(program.programStages[0].programStageSections, processSection);
		addComments();
	};

	var isOptionSetSection = function(section) {
		return section.programStageDataElements[0] && section.programStageDataElements[0].valueType == 'OPTIONSET';
	};

	this.process = function(program) {
		pages = [];
		currentPageIndex = -1;
		_.map([program], function(Program) {
			if(Program.programStages.length == 0) return;
			for(var i = 0; i < Program.programStages[0].programStageSections.length; i++) {
				if(Program.programStages[0].programStageSections.length == 0) return;
				Program.programStages[0].programStageSections[i].programStageDataElements = printFriendlyUtils.getDataElementsToDisplay(Program.programStages[0].programStageSections[i], "programStageDataElements");
				printFriendlyUtils.divideOptionSetsIntoNewSections(Program.programStages[0].programStageSections, i, "programStageDataElements");
				if(!Program.programStages[0].programStageSections[i].isOptionSet)
					printFriendlyUtils.splitLeftAndRightElements(Program.programStages[0].programStageSections[i], "programStageDataElements");
			}
			processProgram(Program)
		});
		return pages;
	}
}]);