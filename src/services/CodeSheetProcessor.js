TallySheets.service('CodeSheetProcessor', ['Config', 'CodeSheetPage', 'CodeSheetElements', 'PrintFriendlyUtils', 'DhisConstants','$q','PageConfigReader', function(config, CodeSheetPage, CodeSheetElements, PrintFriendlyUtils, DhisConstants, $q, PageConfigReader) {
	var page, currentPageIndex, currentColumnIndex, pages, currentRowIndex;
	var lastColumn, maxOptionsPerColumn;
	var dataElementKey = 'programStageDataElements';
	var _pageConfig;
    var totalRows;


    var getNumberOfRows = function() {
		var availableHeight = _pageConfig.height - (_pageConfig.components.border.top + _pageConfig.components.border.top);
		return Math.round((availableHeight - config.CodeSheet.heightOfProgramTitle - config.CodeSheet.pageNumberHeight) / config.CodeSheet.rowHeight);
	};

	var gotoNextColumn = function() {
		if(currentColumnIndex == lastColumn)
			getNewPage();
		else
			currentColumnIndex++;
		page.columns[currentColumnIndex] = [];
		currentRowIndex = 0;
	};

	var getOptionCode = function(optionDisplayName) {
		var startDelimiter = config.Delimiters.optionCodeStartDelimiter;
		var endDelimiter = config.Delimiters.optionCodeEndDelimiter;
		return optionDisplayName.substr(0, optionDisplayName.search(endDelimiter)).replace(startDelimiter, '');
	};

	var addNewCodeSheetHeading = function(dataElementName) {
		if(currentRowIndex >= maxOptionsPerColumn)
			gotoNextColumn();
		page.columns[currentColumnIndex].push(new CodeSheetElements.CodeSheetHeading(dataElementName));
		currentRowIndex++;
	};

	var addNewCodeSheetLabel = function(dataElement, option) {
		if((currentRowIndex == totalRows - 1) && (option.id == dataElement.options[dataElement.options.length - 2].id) || (currentRowIndex >= totalRows)) {
			gotoNextColumn();
			addNewCodeSheetHeading(dataElement.displayFormName);
		}
		var optionCode = getOptionCode(option.displayName);
		page.columns[currentColumnIndex].push(new CodeSheetElements.CodeSheetLabel(optionCode, option.displayName));
		currentRowIndex++;
	};

	var addNewCodeSheetGap = function() {
		if(currentRowIndex >= totalRows)
			return;
		page.columns[currentColumnIndex].push(new CodeSheetElements.CodeSheetGap());
		currentRowIndex++;
	};

	var processCodeSheetElements = function(program) {
		var addDataElementToCodesheet = function(dataElement) {
			if(dataElement.valueType == DhisConstants.ValueTypes.OPTIONSET) {
				addNewCodeSheetHeading(dataElement.displayFormName);
				_.map(dataElement.options, function(option) {
					addNewCodeSheetLabel(dataElement, option);
				});
				addNewCodeSheetGap();
			}
		};
		_(program.programStages[0].programStageSections)
			.map(dataElementKey)
			.flatten()
			.thru(PrintFriendlyUtils.getDataElementsToDisplay)
			.thru(PrintFriendlyUtils.removeHiddenDataElementsInCodeSheet)
			.map(addDataElementToCodesheet)
			.value();
	};

	this.process = function(program,pageConfig) {
		_pageConfig =pageConfig;
		getNewPage = function() {
            var availableHeight = pageConfig.height - (pageConfig.components.border.top + pageConfig.components.border.bottom);
            var availableWidth = pageConfig.width - (pageConfig.components.border.left + pageConfig.components.border.right);
			page = new CodeSheetPage(availableHeight, availableWidth);
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			currentColumnIndex = 0;
			currentRowIndex = 0;
			page.columns[0] = [];
			return page;
		};
        totalRows = getNumberOfRows();
        maxOptionsPerColumn = totalRows - 2;
        lastColumn = config.CodeSheet.numberOfColumns - 1;
		pages = [];
		currentPageIndex = -1;
		page = getNewPage();
		processCodeSheetElements(program);
		return pages;
	};
}]);




