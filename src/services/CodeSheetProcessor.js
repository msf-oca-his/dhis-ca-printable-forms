TallySheets.service('CodeSheetProcessor', ['Config', 'Page', 'CodeSheetElementTypes', 'PrintFriendlyUtils', function(config, Page, CodeSheetElementTypes, printFriendlyUtils) {
	var page, currentPageIndex, currentColumnIndex, pages, currentRowIndex;
	var lastColumn, maxOptionsPerColumn;

	this.getNumberOfRows = function() {
		return Math.round((config.PageTypes.A4.Portrait.availableHeight - config.CodeSheet.heightOfProgramTitle - config.PageTypes.A4.Portrait.graceHeight) / config.CodeSheet.rowHeight);
	};
	var totalRows = this.getNumberOfRows();
	lastColumn = config.CodeSheet.numberOfColumns - 1;
	maxOptionsPerColumn = totalRows - 2;

	var gotoNextColumn = function() {
		if(currentColumnIndex == lastColumn)
			getNewPage();
		else
			currentColumnIndex++;
		page.columns[currentColumnIndex] = [];
		currentRowIndex = 0;
	};

	var addNewCodeSheetHeading = function(dataElementName) {
		if(currentRowIndex >= maxOptionsPerColumn)
			gotoNextColumn();
		page.columns[currentColumnIndex].push(new CodeSheetElementTypes.CodeSheetHeading(dataElementName));
		currentRowIndex++;
	};

	var addNewCodeSheetLabel = function(dataElement, label, code) {
		if((currentRowIndex == totalRows - 1) && (label.id == dataElement.options[dataElement.options.length - 2].id) || (currentRowIndex >= totalRows)) {
			gotoNextColumn();
			addNewCodeSheetHeading(dataElement.displayName);
		}
		page.columns[currentColumnIndex].push(new CodeSheetElementTypes.CodeSheetLabel(code, label.displayName));
		currentRowIndex++;
	};

	var addNewCodeSheetGap = function() {
		if(currentRowIndex >= totalRows)
			return;
		page.columns[currentColumnIndex].push(new CodeSheetElementTypes.CodeSheetGap());
		currentRowIndex++;
	};

	var getCodeSheetElements = function(program) {
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements = printFriendlyUtils.applyDisplayOptionsToDataElements({programStageDataElements: allDataElements}, "programStageDataElements");
		_.map(allDataElements, function(dataElement) {
			if(dataElement.valueType == 'OPTIONSET') {
				addNewCodeSheetHeading(dataElement.displayName);
				_.map(dataElement.options, function(option, index) {
					addNewCodeSheetLabel(dataElement, option, index + 1);
				});
				addNewCodeSheetGap();
			}
		});
	};

	this.process = function(program) {
		pages = [];
		currentPageIndex = -1;

		getNewPage = function() {
			page = new Page('CODESHEET');
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			currentColumnIndex = 0;
			currentRowIndex = 0;
			page.columns[0] = [];
			return page;
		};

		page = getNewPage();
		getCodeSheetElements(program);
		return pages;
	};
}]);




