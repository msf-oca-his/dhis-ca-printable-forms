TallySheets.service('RegisterProcessor', [ 'RegisterPage', 'Content', 'DataElement', 'ContentTypes', 'Config', 'PrintFriendlyUtils','DhisConstants', function(RegisterPage, Content, DataElement, ContentTypes, config, PrintFriendlyUtils, DhisConstants){
	var page, currentPageIndex, pages;

	this.process = function(program) {
		var getNewPage = function() {
			page = new RegisterPage();
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			return page;
		};

		var getWidthOfDataElement = function(dataElement) {
			return (dataElement.valueType == DhisConstants.ValueTypes.TEXT ) ? config.Register.textElementWidth : config.Register.otherElementWidth;
		};

		var distributeDataElementsToPages = function(allDataElements) {
			_.map(allDataElements, function(dataElement, index) {
				page.widthLeft = page.widthLeft - getWidthOfDataElement(dataElement);

				if((allDataElements.length == (index + 1)) && page.widthLeft > 0) {
					dataElementsPerPage.push(dataElement);
				}
				else if(((allDataElements.length - 1) == (index + 1)) && page.widthLeft > getWidthOfDataElement(allDataElements[index + 1])) {
					dataElementsPerPage.push(dataElement);
				}
				else if(((index + 1) < allDataElements.length - 1 ) && page.widthLeft > 0) {
					dataElementsPerPage.push(dataElement);
				}
				else {
					page.contents.push(new Content(ContentTypes.registerContent, dataElementsPerPage));
					dataElementsPerPage = [];
					page = getNewPage();
					page.widthLeft = page.widthLeft - getWidthOfDataElement(dataElement);
					dataElementsPerPage.push(dataElement);
				}
			});
		};

		pages = [];
		currentPageIndex  = -1;
		page = getNewPage();
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements = PrintFriendlyUtils.getDataElementsToDisplay(allDataElements);
		allDataElements.push(new DataElement({displayName: 'Comments', type: DhisConstants.ValueTypes.TEXT}));
		var dataElementsPerPage = [];
		distributeDataElementsToPages(allDataElements);
		if(!_.isEmpty(dataElementsPerPage))
			page.contents.push(new Content(ContentTypes.registerContent, dataElementsPerPage));
		return pages;
	};
}]);
