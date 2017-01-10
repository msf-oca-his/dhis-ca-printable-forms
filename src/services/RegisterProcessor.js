TallySheets.service('RegisterProcessor', ['RegisterPage', 'Content', 'RegisterColumn', 'ContentTypes', 'Config', 'PrintFriendlyUtils', function(RegisterPage, Content, RegisterColumn, ContentTypes, config, PrintFriendlyUtils) {
	var page, currentPageIndex, pages;

	this.process = function(program) {
		var getNewPage = function() {
			page = new RegisterPage();
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			return page;
		};

		var getColumnWidthOption = function(value) {
			return _.filter(config.customAttributes.columnWidthOptionUID.columnWidthOptions, function(option) {
				if(option.code == value) {
					return {code: option.code, width: option.width}
				}
			})
		};
		var getDataElementRenderType = function(dataElement) {
			var columnWidthAttribute = PrintFriendlyUtils.getCustomAttribute(dataElement.attributeValues, "columnWidthOptionUID");
			if(columnWidthAttribute) {
				return getColumnWidthOption(columnWidthAttribute.value)[0];
			}
			return {code:'', width: config.Register.defaultColumnWidth}
		};

		var distributeDataElementsToPages = function(allDataElements) {
			_.map(allDataElements, function(dataElement, index) {
				var dataElementRenderType = getDataElementRenderType(dataElement);
				var registerColumn = new RegisterColumn(dataElement.displayName, dataElementRenderType);
				page.widthLeft = page.widthLeft - dataElementRenderType.width;

				if((allDataElements.length == (index + 1)) && page.widthLeft > 0) {
					registerColumnsPerPage.push(registerColumn);
				}
				else if(((allDataElements.length - 1) == (index + 1)) && page.widthLeft > getDataElementRenderType(allDataElements[index + 1]).width) {
					registerColumnsPerPage.push(registerColumn);
				}
				else if(((index + 1) < allDataElements.length - 1 ) && page.widthLeft > 0) {
					registerColumnsPerPage.push(registerColumn);
				}
				else {
					page.contents.push(new Content(ContentTypes.registerContent, registerColumnsPerPage));
					registerColumnsPerPage = [];
					page = getNewPage();
					var registerColumnRenderType = getDataElementRenderType(dataElement);
					page.widthLeft = page.widthLeft - registerColumnRenderType.width;
					registerColumnsPerPage.push(new RegisterColumn(dataElement.displayName, registerColumnRenderType));
				}
			});
		};

		pages = [];
		currentPageIndex = -1;
		page = getNewPage();
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements = PrintFriendlyUtils.getDataElementsToDisplay(allDataElements);
		var defaultRenderType = { code: '',width: config.Register.defaultColumnWidth };
		var registerColumnsPerPage = [];
		distributeDataElementsToPages(allDataElements);
		registerColumnsPerPage.push(new RegisterColumn('Comments', defaultRenderType));
		if(!_.isEmpty(registerColumnsPerPage))
			page.contents.push(new Content(ContentTypes.registerContent, registerColumnsPerPage));
		return pages;
	};
}]);
