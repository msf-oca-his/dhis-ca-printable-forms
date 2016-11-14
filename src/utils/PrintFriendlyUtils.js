TallySheets.factory('PrintFriendlyUtils', ['Config', function(config) {
	
	this.createNewSectionUsing = function(section, dataElements, dataElementsKey){
		var newSection = _.cloneDeep(section);
		newSection[dataElementsKey] = dataElements;
		return newSection;
	};

	this.isDuplicateSection = function(sectionIndex, sections) {
		if(sectionIndex == 0) return false;
		return sections[sectionIndex].id == sections[sectionIndex - 1].id;
	};
	var isListTypeDataElement = function(dataElement) {
		if(dataElement.valueType != 'OPTIONSET') return false;
		if(!config.CustomAttributes.displayOptionUID) return true;
		var displayOptionAttribute = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
		if(displayOptionAttribute && displayOptionAttribute.value)
			return displayOptionAttribute.value == config.CustomAttributes.displayOptionUID.options.list;
		return true;
	};
	var getIndexOfDEWithOptionSets = function(section, dataElementsKey) {
		var indexOfDEWithOptions = [];
		_.map(section[dataElementsKey], function(dataElement, index) {
			if(isListTypeDataElement(dataElement))
				indexOfDEWithOptions.push(index);
		});
		return indexOfDEWithOptions;
	};

	this.divideOptionSetsIntoNewSections = function(sections, index, dataElementsKey) {
		var section = sections[index];
		var currentIndex = 0;
		var pushIndex = 0;
		var newSection;
		var indexOfDEWithOptions = getIndexOfDEWithOptionSets(section, dataElementsKey);
		if(indexOfDEWithOptions.length == 0) return;
		if((indexOfDEWithOptions.length == 1) && (section[dataElementsKey].length == 1)) {
			// section = this.createOptionSetSection(section, dataElementsKey);
			return;
		}

		var pushSection = function(section, dataElementsKey) {
			if(section[dataElementsKey].length > 0) sections.splice(index + (++pushIndex), 0, section);
		};

		_.map(indexOfDEWithOptions, (function(indexOfDE) {
			newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, indexOfDE), dataElementsKey);
			pushSection(newSection, dataElementsKey);
			newSection = this.createNewSectionUsing(section, [(section[dataElementsKey])[indexOfDE]], dataElementsKey);
			// newSection = this.createOptionSetSection(newSection, dataElementsKey);
			pushSection(newSection, dataElementsKey);
			currentIndex = indexOfDE + 1;
		}).bind(this));

		newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, section[dataElementsKey].length), dataElementsKey);
		pushSection(newSection, dataElementsKey);
		sections.splice(index, 1);
		// sections[index].isDuplicate = false;
	};

	this.divideCatCombsIfNecessary = function(sections, index, dataElementsKey) {
		var section = sections[index];
		var dataElement = (section[dataElementsKey])[0];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < dataElement.categoryCombo.categoryOptionCombos.length) {
			var overflow = dataElement.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			var numberOfColumnsThatCanFitInThisSection = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newDataElements = [];
			_.map(section[dataElementsKey], function(dataElement) {   //TODO: extract this out as function???
				var newDataElement = _.cloneDeep(dataElement);
				newDataElement.categoryCombo.categoryOptionCombos.splice(0, numberOfColumnsThatCanFitInThisSection);
				newDataElements.push(newDataElement);
				dataElement.categoryCombo.categoryOptionCombos.splice(numberOfColumnsThatCanFitInThisSection);
			});
			var newSection = _.cloneDeep(section);
			newSection[dataElementsKey] = newDataElements;
			sections.splice(index + 1, 0, newSection)
		}
	};

	//TODO: extract this to data model util.
	var getCustomAttributeForRenderingOptionSets = function(customAttributes) {
		return _.reduce(_.filter(customAttributes, function(customAttribute) {
			if(customAttribute.attribute.id == config.CustomAttributes.displayOptionUID.id) {
				return customAttribute;
			}
		}));
	};

	this.getDataElementsToDisplay = function(section, dataElementsKey) {
		if(!config.CustomAttributes.displayOptionUID) return section[dataElementsKey];
		return _.filter(section[dataElementsKey], function(dataElement) {
			if(dataElement.valueType == 'OPTIONSET') {
				var displayOptionAttribute = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
				if(displayOptionAttribute) {
					// dataElement.displayOption = displayOptionAttribute.value;
					return displayOptionAttribute.value != config.CustomAttributes.displayOptionUID.options.none;
				}
			}
			return true;
		});
	};
	return this;
}]);