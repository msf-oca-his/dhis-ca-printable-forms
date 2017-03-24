TallySheets.service('CodeSheetProcessor', ['Config', 'CodeSheetPage', 'CodeSheetElements', 'PrintFriendlyUtils', 'DhisConstants', function(config, CodeSheetPage, CodeSheetElements, PrintFriendlyUtils, DhisConstants) {
	var page, currentPageIndex, currentColumnIndex, pages, currentRowIndex;
	var lastColumn, maxOptionsPerColumn;
	var dataElementKey = 'programStageDataElements';
	var pageType = 'A4';
	this.getNumberOfRows = function() {
		return Math.round((config.PageTypes[pageType].Portrait.availableHeight - config.CodeSheet.heightOfProgramTitle - config.CodeSheet.pageNumberHeight) / config.CodeSheet.rowHeight);
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

	var getOptionCode = function(optionDisplayName){
		var optionCode;
		var startDelimiter = config.Delimiters.optionLabelStartDelimiter;
		var endDelimiter = config.Delimiters.optionLabelEndDelimiter;
		var startDelimiterIndex = optionDisplayName.indexOf(startDelimiter);
		var endDelimiterIndex = optionDisplayName.indexOf(endDelimiter);

		if(startDelimiterIndex == -1 || endDelimiterIndex == -1) {
			optionCode = "";
		} else {
				optionCode = optionDisplayName.substring(startDelimiterIndex + 1, endDelimiterIndex);
		}
		return optionCode;
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

	var getCodeSheetElements = function(program) {
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, dataElementKey));
		allDataElements = PrintFriendlyUtils.getDataElementsToDisplay(allDataElements);
		_.map(allDataElements, function(dataElement) {
			if(dataElement.valueType == DhisConstants.ValueTypes.OPTIONSET) {
				addNewCodeSheetHeading(dataElement.displayFormName);
				_.map(dataElement.options, function(option) {
					addNewCodeSheetLabel(dataElement, option);
				});
				addNewCodeSheetGap();
			}
		});
	};

	this.process = function(program) {
		getNewPage = function() {
			page = new CodeSheetPage();
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			currentColumnIndex = 0;
			currentRowIndex = 0;
			page.columns[0] = [];
			return page;
		};

		pages = [];
		currentPageIndex = -1;
		page = getNewPage();
		getCodeSheetElements(program);
		return pages;
	};
}]);




