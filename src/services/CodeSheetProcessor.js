TallySheets.service('CodeSheetProcessor', ['Config', 'Page', 'PrintFriendlyUtils', function(config, Page, printFriendlyUtils) {
	var page, currentPageIndex, pages;

	this.process = function(program) {
		pages = [];
		currentPageIndex  = -1;

		var getNewPage = function() {
			page = new Page("CODESHEET");
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			return page;
		};

		page = getNewPage();
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements = printFriendlyUtils.applyDisplayOptionsToDataElements({programStageDataElements: allDataElements}, "programStageDataElements");
		_.map(allDataElements, function(dataElement){
			if(dataElement.valueType == 'OPTIONSET')
				page.contents.push(dataElement);
		});
		page = getNewPage();
		return pages;
	};
}]);




