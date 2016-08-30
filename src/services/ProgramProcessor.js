TallySheets.service("ProgramProcessor", ['DataElement', 'DataSetSection', 'Config', '$translate', function(DataElement, DataSetSection, config, $translate) {
	var pages = [];
	var currentPageIndex;
	var page;
	var registerPage = 'register';
	var coverSheetPage = 'coversheet';

	var Page = function(type) {
		var page = {};
		page.heightLeft = (type == coverSheetPage) ? config.DataSet.availableHeight : config.Register.availableHeight - config.Register.headerHeight;
		page.widthLeft = (type == coverSheetPage) ? config.DataSet.availableWidth : config.Register.availableWidth;
		page.contents = [];
		return page;
	};
	var processTableHeader = function(section) {
		_.map(section.programStageDataElements[0].categoryCombo.categoryOptionCombos, function(categoryOptionCombo, index, arr) {
			arr[index] = categoryOptionCombo.replace(/,/g, "<br>");
		});
	};

	var divideOptionSetsIntoNewSection = function(section, index, sections) {
		var indexOfDEWithOptions = [];
		var currentIndex = 0;
		var pushIndex = 0;
		var newSection;
		var simplifySection = function(section) {
			var dataElement = section.programStageDataElements[0];
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

		_.map(section.programStageDataElements, function(dataElement, index) {
			if(dataElement.valueType == 'OPTIONSET' && (dataElement.displayOption == config.CustomAttributes.displayOptionUID.options.list || !dataElement.displayOption)) {
				indexOfDEWithOptions.push(index);
			}
		});
		if((indexOfDEWithOptions.length == 1) && (section.programStageDataElements.length == 1)) {
			section = simplifySection(section)
			section.isOptionSet = true;
			return;
		}

		var pushSection = function(section) {
			if(section.programStageDataElements.length > 0) sections.splice(index + (++pushIndex), 0, section);
		};

		var cloneSection = function(section, dataElements) {
			var newSection = _.cloneDeep(section);
			newSection.isDuplicate = true;
			newSection.programStageDataElements = dataElements;
			return newSection;
		};

		_.map(indexOfDEWithOptions, function(indexOfDE) {
			newSection = cloneSection(section, _.slice(section.programStageDataElements, currentIndex, indexOfDE));
			pushSection(newSection);
			newSection = cloneSection(section, [section.programStageDataElements[indexOfDE]]);
			newSection = simplifySection(newSection);
			newSection.isOptionSet = true;
			pushSection(newSection);
			currentIndex = indexOfDE + 1;
		});

		if(indexOfDEWithOptions.length > 0) {
			newSection = cloneSection(section, _.slice(section.programStageDataElements, currentIndex, section.programStageDataElements.length));
			pushSection(newSection);
			sections.splice(index, 1);
			sections[index].isDuplicate = false;
		}
	};
	var divideCatCombsIfNecessary = function(section, index, sections) {
		var dataElement = section.programStageDataElements[0];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < dataElement.categoryCombo.categoryOptionCombos.length) {
			var overflow = dataElement.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			numberOfFittingColumns = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newDataElements = [];
			_.map(section.programStageDataElements, function(dataElement) {
				var newDataElement = _.cloneDeep(dataElement);
				newDataElement.categoryCombo.categoryOptionCombos.splice(0, numberOfFittingColumns);
				newDataElements.push(newDataElement);
				dataElement.categoryCombo.categoryOptionCombos.splice(numberOfFittingColumns);
			});
			var newSection = _.cloneDeep(section)
			newSection.isDuplicate = true;
			newSection.programStageDataElements = newDataElements;
			sections.splice(index + 1, 0, newSection)
		}
	};

	var getDataElementsToSplit = function(dataElements) {
		var dataElementsOfOptionTypeText = [];
		_.map(dataElements, function(dataElement) {
			if(dataElement.displayOption != config.CustomAttributes.displayOptionUID.options.list) {
				dataElementsOfOptionTypeText.push(dataElement);
			}
		});
		return dataElementsOfOptionTypeText;
	};

	var splitLeftAndRightElements = function(section) {
		var dataElements = getDataElementsToSplit(section.programStageDataElements);
		if(!_.isEmpty(dataElements)) {
			section.leftSideElements = _.slice(dataElements, 0, Math.ceil(dataElements.length / 2));
			section.rightSideElements = _.slice(dataElements, Math.ceil(dataElements.length / 2));
		}
	};

	var processDataSet = function(dataSet) {

		var processSection = function(section, sectionIndex) {

			var getHeightForSection = function(section) {
				var height;
				if(section.isCatComb)
					height = config.DataSet.heightOfDataElementInCatCombTable * (section.programStageDataElements.length ) + config.DataSet.heightOfTableHeader + config.DataSet.gapBetweenSections;
				else if(section.isOptionSet)
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements[0].rows.length)) + config.DataSet.gapBetweenSections;
				else
					height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.programStageDataElements.length / 2)) + config.DataSet.gapBetweenSections;

				return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
			};

			var addSectionToPage = function(section, height) {
				var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
				if(isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
				page.contents.push({type: 'section', section: section});
				page.heightLeft = page.heightLeft - height;
			};

			var addSectionToNewPage = function(section, height, isFirstSectionInDataSet) {
				page = new Page(coverSheetPage);
				page.programName = dataSet.name;
				pages[++currentPageIndex] = page;
				section.isDuplicate = false;
				processSection(section, isFirstSectionInDataSet);
			};

			var getNumberOfElementsThatCanFit = function(section) {
				var overFlow = sectionHeight - page.heightLeft;
				if(section.isCatComb) {
					var numberOfOrphanDataElements = overFlow / config.DataSet.heightOfDataElementInCatCombTable;
					var numberOfDataElements = section.programStageDataElements.length;
					return (numberOfOrphanDataElements > 1) ? (numberOfDataElements - numberOfOrphanDataElements) : (numberOfDataElements - numberOfOrphanDataElements - 1);
				}
				else if(section.isOptionSet)
					return section.programStageDataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
				else
					return section.programStageDataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
			};
			var breakAndAddSection = function(section) {
				if(section.isCatComb) {
					var newSection = _.cloneDeep(section);
					newSection.programStageDataElements = section.programStageDataElements.splice(numberOfElementsThatCanFit);
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
					newSection.programStageDataElements[0].options = section.programStageDataElements[0].options.splice(numberOfElementsThatCanFit);
					divideOptionSetsIntoNewSection(section);
					divideOptionSetsIntoNewSection(newSection);
					newSection.isDuplicate = true;
					addSectionToPage(section, page.heightLeft);
					addSectionToNewPage(newSection, getHeightForSection(newSection), false);
				}
				else {
					var newSection = _.cloneDeep(section);
					(numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
					newSection.programStageDataElements = section.programStageDataElements.splice(numberOfElementsThatCanFit);
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

				if(numberOfElementsThatCanFit == section.programStageDataElements.length)
					addSectionToPage(section, sectionHeight);
				else if(numberOfElementsThatCanFit > 1)
					breakAndAddSection(section);
				else {
					var isFirstSectionInDataSet = sectionIndex == 0;
					addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
				}
			}
		};

		var addComments = function() {
			var lastPage = pages[pages.length - 1];
			if(lastPage.heightLeft > 30)
				lastPage.contents.push({type: 'comments'});
			else {
				var newPage = new Page(coverSheetPage);
				newPage.contents.push({type: 'comments'});
				pages.push(newPage);
			}

		};

		if(!pages[currentPageIndex]) {
			page = new Page(coverSheetPage);
			page.programName = dataSet.name;
			pages[++currentPageIndex] = page;
		}
		else {
			page = pages[currentPageIndex];
		}

		_.map(dataSet.programStages[0].programStageSections, processSection);
		addComments();
		dataSet.isPrintFriendlyProcessed = true;
	};

	var processRegisterProgram = function(program) {
		var getNewPage = function() {
			page = new Page(registerPage);
			page.programName = program.name;
			pages[++currentPageIndex] = page;
			return page;
		};

		var getWidthOfDataElement = function(dataElement) {
			return (dataElement.valueType == 'TEXT') ? config.Register.textElementWidth : config.Register.otherElementWidth;
		};

		page = getNewPage();
		var allDataElements = _.flatten(_.map(program.programStages[0].programStageSections, 'programStageDataElements'));
		allDataElements.push(new DataElement({name: 'Comments', type: 'TEXT'}))
		_.map(allDataElements, function(dataElement, index) {
			page.widthLeft = page.widthLeft - getWidthOfDataElement(dataElement);
			if((allDataElements.length == (index + 1)) && page.widthLeft > 0) {
				page.contents.push(dataElement);
			}
			else if(((allDataElements.length - 1) == (index + 1)) && page.widthLeft > getWidthOfDataElement(allDataElements[index + 1])) {
				page.contents.push(dataElement);
			}
			else if(((index + 1) < allDataElements.length - 1 ) && page.widthLeft > 0) {
				page.contents.push(dataElement);
			}
			else {
				page = getNewPage();
				page.widthLeft = page.widthLeft - getWidthOfDataElement(dataElement);
				page.contents.push(dataElement);
			}
		});
	};
	var getCustomAttributeForRenderingOptionSets = function(attributeValues) {
		return _.reduce(_.filter(attributeValues, function(attributeValue) {
			if(attributeValue.attribute.id === config.CustomAttributes.displayOptionUID.id) {
				return attributeValue;
			}
		}));
	};

	var isAttributeValueValid = function(attributeValue) {
		var configOptions = _.map(config.CustomAttributes.displayOptionUID.options, function(option) {
			return option
		});
		return configOptions.includes(attributeValue);
	};

	function getModifiedPrograms(program) {
		_.map(program.programStages, function(programStage) {
			_.map(programStage.programStageSections, function(programStageSection) {
				_.map(programStageSection.programStageDataElements, function(dataElement) {
					if(dataElement.valueType == 'OPTIONSET') {
						var attributeValue = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
						if(attributeValue && attributeValue.value) {
							var isValid = isAttributeValueValid(attributeValue.value);
							if(isValid) {
								dataElement.displayOption = attributeValue.value;
							}
							else {
								$translate('OPTIONSET_WITH_INCORRECT_OPTIONS').then(function(translatedValue) {
									alert(translatedValue);
								});
							}
						}
					}
				});
				_.remove(programStageSection.programStageDataElements, function(dataElement) {
					return dataElement.displayOption == config.CustomAttributes.displayOptionUID.options.none;
				});
			});
		});
		return program;
	}

	this.process = function(program, mode) {
		pages = [];
		currentPageIndex = -1;
		var Program = getModifiedPrograms(program);
		if(mode == 'COVERSHEET') {
			_.map([Program], function(Program) {
				if(Program.programStages.length == 0) return;
				for(var i = 0; i < Program.programStages[0].programStageSections.length; i++) {
					if(Program.programStages[0].programStageSections.length == 0) return;
					if(Program.programStages[0].programStageSections[i].isCatComb) {//TODO: revalidate this, is it needed.
						divideCatCombsIfNecessary(Program.programStages[0].programStageSections[i], i, Program.programStages[0].programStageSections);
						processTableHeader(Program.programStages[0].programStageSections[i]);
					}
					else {
						divideOptionSetsIntoNewSection(Program.programStages[0].programStageSections[i], i, Program.programStages[0].programStageSections);
						splitLeftAndRightElements(Program.programStages[0].programStageSections[i]);
					}
				}
				processDataSet(Program)
			});
		}
		else if(mode == 'REGISTER') {
			processRegisterProgram(Program);
		}
		return pages;
	}
}]);