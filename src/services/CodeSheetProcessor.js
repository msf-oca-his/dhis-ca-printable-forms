TallySheets.service('CodeSheetProcessor', ['Config', 'Page', 'CodeSheet', 'PrintFriendlyUtils', function(config, Page, CodeSheet, printFriendlyUtils) {
	var page, currentPageIndex, pages, codeSheetArray;
	var array1, array2, array3;

	var getNumberOfRows = function() {
		return Math.round((config.CodeSheet.availableHeight - config.CodeSheet.heightOfProgramTitle - config.CodeSheet.graceHeight) / config.CodeSheet.rowHeight);
	};

	this.process = function(program) {
		pages = [];
		codeSheetArray = [];
		currentPageIndex = -1;
		array1 = array2 = array3 = [];

		var getNewPage = function() {
			page = new Page("CODESHEET");
			page.programName = program.displayName;
			pages[++currentPageIndex] = page;
			return page;
		};

		var getLastDataElementHeader = function(array) {
			return _.last(_.filter(array, ['type', "Heading"]));
		};

		var modifyColumn = function(array) {
			var rows = getNumberOfRows();
			//see if first element is gap, if so remove it from array
			if(array[0].type == "Gap")
				array.splice(0, 1);
			var modifiedArray = array.splice(0, rows);

			console.log(modifiedArray, "mm")
			console.log(_.cloneDeep(array), "aa")

			//orphan heading
			if(modifiedArray[modifiedArray.length - 1].type == "Heading") {
				array.unshift(modifiedArray[modifiedArray.length - 1]);
				modifiedArray.splice(modifiedArray.length - 1, 1)
			}
			//orphan option
			else if(modifiedArray[modifiedArray.length - 2].type == "Heading") {
				array.unshift(modifiedArray[modifiedArray.length - 1]);
				array.unshift(modifiedArray[modifiedArray.length - 2]);
				modifiedArray.splice(modifiedArray.length - 2, 2)
			}
			//add heading to remaining array
			else if(!_.isEmpty(_.filter(array, ['type', "Label"]))) {
				array.unshift(getLastDataElementHeader(modifiedArray)); //loop from backwards and get first data element
			}

			return modifiedArray;
		};

		var divideIntoColumns = function(codeSheetArray) {
			if(_.isEmpty(codeSheetArray))
				return;

			if(!_.isEmpty(codeSheetArray)) {
				array1 = modifyColumn(codeSheetArray)
				page.contents.push(array1);

				if(!_.isEmpty(codeSheetArray)) {
					array2 = modifyColumn(codeSheetArray)
					page.contents.push(array2);

					if(!_.isEmpty(codeSheetArray)) {
						array3 = modifyColumn(codeSheetArray)
						page.contents.push(array3);

						if(!_.isEmpty(codeSheetArray)) {
							page = getNewPage();
							divideIntoColumns(codeSheetArray);
						}
					}
				}
			}
			console.log(codeSheetArray, "codeSheetArray");
			console.log(page, "page")
		};

		page = getNewPage();
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements = printFriendlyUtils.applyDisplayOptionsToDataElements({programStageDataElements: allDataElements}, "programStageDataElements");
		_.map(allDataElements, function(dataElement) {
			if(dataElement.valueType == 'OPTIONSET') {
				codeSheetArray.push(new CodeSheet("Code", dataElement.displayName, "Heading"));
				_.map(dataElement.options, function(option, index) {
					codeSheetArray.push(new CodeSheet(index + 1, option.displayName, "Label"))
				})
				codeSheetArray.push(new CodeSheet("", "", "Gap"))
			}
		});

		divideIntoColumns(codeSheetArray);
		console.log(pages, "pages")
		return pages;

	};

}]);




