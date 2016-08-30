TallySheets.factory('PrintFriendlyUtils', [ 'Config', function(config) {

	this.createOptionSetSection = function(section, dataElementsKey) {
		var dataElement = (section[dataElementsKey])[0];
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
		section.isOptionSet = true;
		return section;
	};

	this.createNewSectionUsing = function(section, dataElements, dataElementsKey){
		var newSection = _.cloneDeep(section);
		newSection.isDuplicate = true;
		newSection[dataElementsKey] = dataElements;
		return newSection;
	};

	this.addLineBreakAfterEachCategoryOption = function(section, dataElementsKey) {
		_.map((section[dataElementsKey])[0].categoryCombo.categoryOptionCombos, function(categoryOptionCombo, index, array) {
			array[index] = categoryOptionCombo.toString().replace(/,/g, "<br>");
		});
	};
	var getIndexOfDEWithOptionSets = function(section, dataElementsKey){
		var indexOfDEWithOptions = [];
		_.map(section[dataElementsKey], function(dataElement, index) {
			if(dataElement.valueType == 'OPTIONSET' && (dataElement.displayOption == config.DisplayOptions.list || !dataElement.displayOption))
				indexOfDEWithOptions.push(index);
		});
		return indexOfDEWithOptions;
	};

	this.divideOptionSetsIntoNewSections = function(sections, index, dataElementsKey ) {
		var section = sections[index];
		var currentIndex = 0;
		var pushIndex = 0;
		var newSection;
		var indexOfDEWithOptions = getIndexOfDEWithOptionSets(section, dataElementsKey);
		if(indexOfDEWithOptions.length == 0) return;
		if((indexOfDEWithOptions.length == 1) && (section[dataElementsKey].length == 1)) {
			section = this.createOptionSetSection(section, dataElementsKey);
			return;
		}

		var pushSection = function(section, dataElementsKey) {
			if(section[dataElementsKey].length > 0) sections.splice(index + (++pushIndex), 0, section);
		};

		_.map(indexOfDEWithOptions, (function(indexOfDE) {
			newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, indexOfDE), dataElementsKey);
			pushSection(newSection, dataElementsKey);
			newSection = this.createNewSectionUsing(section, [(section[dataElementsKey])[indexOfDE]], dataElementsKey);
			newSection = this.createOptionSetSection(newSection, dataElementsKey);
			newSection.isOptionSet = true;
			pushSection(newSection, dataElementsKey);
			currentIndex = indexOfDE + 1;
		}).bind(this));

		newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, section[dataElementsKey].length), dataElementsKey);
		pushSection(newSection, dataElementsKey);
		sections.splice(index, 1);
		sections[index].isDuplicate = false;
	};

	this.divideCatCombsIfNecessary = function(sections, index, dataElementsKey) {
		var section = sections[index];
		var dataElement = (section[dataElementsKey])[0];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < dataElement.categoryCombo.categoryOptionCombos.length) {
			var overflow = dataElement.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			var numberOfColumnsThatCanFitInThisSection = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newDataElements = [];
			_.map(section[dataElementsKey], function(dataElement) {
				var newDataElement = _.cloneDeep(dataElement);
				newDataElement.categoryCombo.categoryOptionCombos.splice(0, numberOfColumnsThatCanFitInThisSection);
				newDataElements.push(newDataElement);
				dataElement.categoryCombo.categoryOptionCombos.splice(numberOfColumnsThatCanFitInThisSection);
			});
			var newSection = _.cloneDeep(section)
			newSection.isDuplicate = true;
			newSection[dataElementsKey] = newDataElements;
			sections.splice(index + 1, 0, newSection)
		}
	};

	this.splitLeftAndRightElements = function(section, dataElementsKey) {
		section.leftSideElements = _.slice(section[dataElementsKey], 0, Math.ceil(section[dataElementsKey].length / 2));
		section.rightSideElements = _.slice(section[dataElementsKey], Math.ceil(section[dataElementsKey].length / 2));
	};

	//TODO: extract this to data model util.
	var getCustomAttributeForRenderingOptionSets = function(customAttributes) {
		return _.reduce(_.filter(customAttributes, function(customAttribute) {
			if(customAttribute.attribute.id === config.CustomAttributes.displayOptionUID) {
				return customAttribute;
			}
		}));
	};

	var isDisplayOptionNoneSelected = function(dataElement){
		return dataElement.displayOption == config.DisplayOptions.none;
	};

	this.applyDisplayOptionsToDataElements = function(section, dataElementsKey) {
		return _.filter(section[dataElementsKey], function(dataElement) {
			if(dataElement.valueType == 'OPTIONSET') {
				var displayOptionAttribute = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
				if(displayOptionAttribute) {
					dataElement.displayOption = displayOptionAttribute.value;
					return !isDisplayOptionNoneSelected(dataElement)
				}
			}
			return true;
		});
	};
return this;
}]);