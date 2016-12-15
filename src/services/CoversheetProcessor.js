TallySheets.service('CoversheetProcessor', [ 'Config', 'Content', 'ContentTypes', 'DefaultContent', 'OptionSetContent', 'CoverSheetPage', 'PrintFriendlyUtils',
	function(config, Content, ContentTypes, DefaultContent, OptionSetContent, CoverSheetPage, printFriendlyUtils) {
	var pages = [];
	var currentPageIndex;
	var page;
	var noOfDefaultTypeColumns = 2;
	var numberOfColumns = config.OptionSet.numberOfColumns;
	var defaultHeightOfDataElementLabel = config.Coversheet.defaultHeightOfDataElementLabel;


	var processProgram = function(program) {

		var processSection = function(section, sectionIndex) {
			var getHeightForSection = function(section) {
				var height;
				var gapBetweenSections = config.Coversheet.gapBetweenSections;

				if (printFriendlyUtils.isOptionSetSection(section, 'programStageDataElements'))
					height = defaultHeightOfDataElementLabel * (Math.ceil(section.programStageDataElements[0].options.length / numberOfColumns)) + gapBetweenSections;
				else
					height = defaultHeightOfDataElementLabel * (Math.ceil(section.programStageDataElements.length / noOfDefaultTypeColumns)) + gapBetweenSections;

				return printFriendlyUtils.isDuplicateSection(sectionIndex, program.programStages[0].programStageSections) ? height : height + config.Coversheet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isDuplicate = printFriendlyUtils.isDuplicateSection(sectionIndex, program.programStages[0].programStageSections)
				if(isDuplicate && !_.isEmpty(page.contents)) section.name = "";
				if(printFriendlyUtils.isOptionSetSection(section, 'programStageDataElements'))
					page.contents.push(new Content(ContentTypes.optionSet, new OptionSetContent(section, 'programStageDataElements')));
				else
					page.contents.push(new Content(ContentTypes.default, new DefaultContent(section, 'programStageDataElements')));

				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height) {
				page = new CoverSheetPage();
				page.programName = program.displayName;
				pages[++currentPageIndex] = page;
				processSection(section, sectionIndex);
			};

			var getNumberOfOptionsThatCanFit = function(section){
				var overFlow = sectionHeight - page.heightLeft;
				return section.programStageDataElements[0].options.length - Math.ceil(overFlow * numberOfColumns / (defaultHeightOfDataElementLabel));
			};

			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(printFriendlyUtils.isOptionSetSection(section, 'programStageDataElements'))
					return section.programStageDataElements[0].options.length - Math.round(overFlow * numberOfColumns / (defaultHeightOfDataElementLabel));
				else
					return section.programStageDataElements.length - Math.round(overFlow * noOfDefaultTypeColumns / (defaultHeightOfDataElementLabel));
			};

			var breakAndAddSection = function(section) {
				if(printFriendlyUtils.isOptionSetSection(section, 'programStageDataElements')) {
					var newSection = _.cloneDeep(section);
					var numberOfOptionsThatCanFit = getNumberOfOptionsThatCanFit(section);
					if(numberOfOptionsThatCanFit <= numberOfColumns){
						addSectionToNewPage(section, getHeightForSection(section), false);
						return
					}
					if(numberOfOptionsThatCanFit % numberOfColumns > 0)
						numberOfOptionsThatCanFit = numberOfOptionsThatCanFit + (numberOfColumns - numberOfOptionsThatCanFit % numberOfColumns);
					newSection.programStageDataElements[0].options = section.programStageDataElements[0].options.splice(numberOfOptionsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % noOfDefaultTypeColumns == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.programStageDataElements = section.programStageDataElements.splice(numberOfElementsThatCanFit);
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection));
				}
			};

			var sectionHeight = getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0)
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section);
				if(numberOfElementsThatCanFit == section.programStageDataElements.length)
					addSectionToPage(section, sectionHeight);
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else if (printFriendlyUtils.isOptionSetSection(section, 'programStageDataElements'))
					breakAndAddSection(section, numberOfElementsThatCanFit);
				else {
					addSectionToNewPage(section, sectionHeight)
				}
			}
		};

		var addComments = function() {
			var lastPage = pages[pages.length - 1];
			if(lastPage.heightLeft > config.Coversheet.commentsHeight)
				lastPage.contents.push(new Content(ContentTypes.comments));
			else {
				var newPage = new CoverSheetPage();
				newPage.contents.push(new Content(ContentTypes.comments));
				pages.push(newPage);
			}

		};

		if(!pages[currentPageIndex]) {
			page = new CoverSheetPage();
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}

		_.map(program.programStages[0].programStageSections, processSection);
		addComments();
	};


	this.process = function(program) {
		pages = [];
		currentPageIndex = -1;
		_.map([program], function(Program) {
			if(Program.programStages.length == 0) return;

			var programStageSections = Program.programStages[0].programStageSections;

			for(var i = 0; i < programStageSections.length; i++) {
				if(programStageSections.length == 0) return;
				programStageSections[i].programStageDataElements = printFriendlyUtils.getDataElementsToDisplay(programStageSections[i], "programStageDataElements");
				printFriendlyUtils.divideOptionSetsIntoNewSections(programStageSections, i, "programStageDataElements");
			}
			processProgram(Program)
		});
		return pages;
	}
}]);