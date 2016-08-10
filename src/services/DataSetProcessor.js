//TODO change processor name
TallySheets.service("PrintFriendlyProcessor", ['CustomAttributeService', 'Config', 'Page', function(CustomAttributeService, config, Page) {
	var pages = [];
	var currentPageIndex;
	var page;

	var processTableHeader = function(section) {
		_.map(section.dataElements[0].categoryCombo.categoryOptionCombos, function(categoryOptionCombo, index, arr) {
			arr[index] = categoryOptionCombo.toString().replace(/,/g, "<br>");
		});
	};

	var divideOptionSetsIntoNewSection = function(section, index, sections) {
		var indexOfDEWithOptions = [];
		var currentIndex = 0;
		var pushIndex = 0;
		var newSection;

		var simplifySection = function(section) {
			var dataElement = section.dataElements[0];
			dataElement.rows = [];
			var numberOfRows = Math.ceil(dataElement.options.length / 3);
			for(var i = 0; i < numberOfRows; i++) {
				var j = 0;
				while(j < dataElement.options.length) {
					if(j == 0)
						dataElement.rows.push([dataElement.options[i]])
					else if(dataElement.options[i + j] != undefined)
						dataElement.rows[i].push(dataElement.options[i + j])
					j = j + numberOfRows;
				}
			}
			return section;
		};

		_.map(section.dataElements, function(dataElement, index) {

			if(dataElement.valueType == 'OPTIONSET') {
				indexOfDEWithOptions.push(index);
			}
		});
		if((indexOfDEWithOptions.length == 1) && (section.dataElements.length == 1)) {
			section = simplifySection(section)
			section.isOptionSet = true;
			return;
		}

		var pushSection = function(section) {
			if(section.dataElements.length > 0) sections.splice(index + (++pushIndex), 0, section);
		};

		var cloneSection = function(section, dataElements) {
			var newSection = _.cloneDeep(section);
			newSection.isDuplicate = true;
			newSection.dataElements = dataElements;
			return newSection;
		};

		_.map(indexOfDEWithOptions, function(indexOfDE) {
			newSection = cloneSection(section, _.slice(section.dataElements, currentIndex, indexOfDE));
			pushSection(newSection);
			newSection = cloneSection(section, [section.dataElements[indexOfDE]]);
			newSection = simplifySection(newSection);
			newSection.isOptionSet = true;
			pushSection(newSection);
			currentIndex = indexOfDE + 1;
		});

		if(indexOfDEWithOptions.length > 0) {
			newSection = cloneSection(section, _.slice(section.dataElements, currentIndex, section.dataElements.length));
			pushSection(newSection);
			sections.splice(index, 1);
			sections[index].isDuplicate = false;
		}
	};
	var divideCatCombsIfNecessary = function(section, index, sections) {
		var dataElement = section.dataElements[0];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < dataElement.categoryCombo.categoryOptionCombos.length) {
			var overflow = dataElement.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			numberOfFittingColumns = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newDataElements = [];
			_.map(section.dataElements, function(dataElement) {
				var newDataElement = _.cloneDeep(dataElement);
				newDataElement.categoryCombo.categoryOptionCombos.splice(0, numberOfFittingColumns);
				newDataElements.push(newDataElement);
				dataElement.categoryCombo.categoryOptionCombos.splice(numberOfFittingColumns);
			});
			var newSection = _.cloneDeep(section)
			newSection.isDuplicate = true;
			newSection.dataElements = newDataElements;
			sections.splice(index + 1, 0, newSection)
		}
	};

	var splitLeftAndRightElements = function(section) {
		section.leftSideElements = _.slice(section.dataElements, 0, Math.ceil(section.dataElements.length / 2));
		section.rightSideElements = _.slice(section.dataElements, Math.ceil(section.dataElements.length / 2));
	};

	var processDataSet = function(dataSet) {

		var processSection = function(section, sectionIndex) {

			var getHeightForSection = function(section) {
				var height;
				if(section.isCatComb)
					height = config.DataSet.heightOfDataElementInCatCombTable * (section.dataElements.length ) + config.DataSet.heightOfTableHeader + config.DataSet.gapBetweenSections;
				else if(section.isOptionSet)
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements[0].options.length / 3)) + config.DataSet.gapBetweenSections;
				else
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + config.DataSet.gapBetweenSections;

				return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
				page.contents.push({type: 'section', section: section});
				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
				page = new Page();
				page.datasetName = dataSet.name;
				pages[++currentPageIndex] = page;
				section.isDuplicate = false;
				processSection(section, isFirstSectionInDataSet);
			};

			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(section.isCatComb) {
					var numberOfOrphanDataElements = Math.floor(overFlow / config.DataSet.heightOfDataElementInCatCombTable);
					var numberOfDataElements = section.dataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(section.isOptionSet)
					return section.dataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
				else
					return section.dataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
			};
			var breakAndAddSection = function(section) {
				if(section.isCatComb) {
					var newSection = _.cloneDeep(section);
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					newSection.isDuplicate = true;
					processTableHeader(newSection);
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInDataSet = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
				}
				else if(section.isOptionSet) {
					var newSection = _.cloneDeep(section);
					if(numberOfElementsThatCanFit % 3 > 0)
						numberOfElementsThatCanFit = numberOfElementsThatCanFit + (3 - numberOfElementsThatCanFit % 3);
					newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfElementsThatCanFit);
					divideOptionSetsIntoNewSection(section);
					divideOptionSetsIntoNewSection(newSection);
					newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
					splitLeftAndRightElements(section);
					splitLeftAndRightElements(newSection);
					newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					var isFirstSectionInDataSet = false;
					addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
				}
			};

			var sectionHeight = (sectionIndex == 0) ? getHeightForSection(section) + config.DataSet.heightOfDataSetTitle : getHeightForSection(section);
			var overflow = sectionHeight - page.heightLeft;
			if(overflow < 0)
				addSectionToPage(section, sectionHeight);
			else if(overflow < config.DataSet.graceHeight)
				addSectionToPage(section, sectionHeight);
			else {
				var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section)

				if(numberOfElementsThatCanFit == section.dataElements.length)
					addSectionToPage(section, sectionHeight);
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section);
				else {
					var isFirstSectionInDataSet = sectionIndex == 0;
					addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
				}
			}
		};

		if(!pages[currentPageIndex]) {
			page = new Page();
			page.datasetName = dataSet.name;
			pages[currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}
		_.map(dataSet.sections, processSection);

		dataSet.isPrintFriendlyProcessed = true;
	};

	var getCustomAttributeForRenderingOptionSets = function(attributeValues) {
		return _.reduce(_.filter(attributeValues, function(attributeValue) {
			if(attributeValue.attribute.id === config.CustomAttributes.displayOptionUID) {
				return attributeValue;
			}
		}));
	};

	function getModifiedDataSet(dataset) {
		var dataElements = [];
		_.map(dataset.sections, function(section) {
			_.map(section.dataElements, function(dataElement) {
				var attributeValue = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
				if(attributeValue) {
					dataElement.displayOption = attributeValue.value;
				}
				dataElements.push(dataElement);
			});
		});
		dataset.sections.dataElements = dataElements;
		return dataset;
	}

	this.process = function(dataset) {
		pages = [];
		currentPageIndex = 0;
		var dataSet = getModifiedDataSet(dataset);
		_.map([dataSet], function(dataSet) {
			for(var i = 0; i < dataSet.sections.length; i++) {
				if(dataSet.sections[i].isCatComb) {
					divideCatCombsIfNecessary(dataSet.sections[i], i, dataSet.sections);
					processTableHeader(dataSet.sections[i]);
				}
				else {
					divideOptionSetsIntoNewSection(dataSet.sections[i], i, dataSet.sections);
					splitLeftAndRightElements(dataSet.sections[i]);
				}
			}
			processDataSet(dataSet)
		});
		return pages;
	}
}])
;