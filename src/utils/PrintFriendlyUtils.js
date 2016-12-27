TallySheets.factory('PrintFriendlyUtils', ['Config', 'ValueTypes', function(config, ValueTypes) {

	var isListTypeDataElement = function(dataElement) {
		if(dataElement.valueType != ValueTypes.OPTIONSET) return false;
		if(!config.customAttributes.displayOptionUID) return true;
		var displayOptionAttribute = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
		if(displayOptionAttribute && displayOptionAttribute.value)
			return displayOptionAttribute.value == config.customAttributes.displayOptionUID.options.list;
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

	var getCustomAttributeForRenderingOptionSets = function(customAttributes) {
		return _.reduce(_.filter(customAttributes, function(customAttribute) {
			if(customAttribute.attribute.id == config.customAttributes.displayOptionUID.id) {
				return customAttribute;
			}
		}));
	};

	this.createNewSectionUsing = function(section, dataElements, dataElementsKey) {
		var newSection = _.cloneDeep(section);
		newSection[dataElementsKey] = dataElements;
		return newSection;
	};

	this.isDuplicateSection = function(sectionIndex, sections) {
		if(sectionIndex == 0) return false;
		return sections[sectionIndex].id == sections[sectionIndex - 1].id;
	};

	this.divideOptionSetsIntoNewSections = function(sections, index, dataElementsKey) {
		var section = sections[index];
		var currentIndex = 0;
		var pushIndex = 0;
		var newSection;
		var indexOfDEWithOptions = getIndexOfDEWithOptionSets(section, dataElementsKey);
		if(indexOfDEWithOptions.length == 0) return;
		if((indexOfDEWithOptions.length == 1) && (section[dataElementsKey].length == 1))  return;

		var pushSection = function(section, dataElementsKey) {
			if(section[dataElementsKey].length > 0)
				sections.splice(index + (++pushIndex), 0, section);
		};

		_.map(indexOfDEWithOptions, (function(indexOfDE) {
			newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, indexOfDE), dataElementsKey);
			pushSection(newSection, dataElementsKey);
			newSection = this.createNewSectionUsing(section, [(section[dataElementsKey])[indexOfDE]], dataElementsKey);
			pushSection(newSection, dataElementsKey);
			currentIndex = indexOfDE + 1;
		}).bind(this));

		newSection = this.createNewSectionUsing(section, _.slice(section[dataElementsKey], currentIndex, section[dataElementsKey].length), dataElementsKey);
		pushSection(newSection, dataElementsKey);
		sections.splice(index, 1);
	};

	this.isOptionSetSection = function(section, dataElementsKey) {
		return section[dataElementsKey][0] && isListTypeDataElement(section[dataElementsKey][0]);
	};

	this.divideCatCombsIfNecessary = function(sections, index) {
		var section = sections[index];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < section.categoryCombo.categoryOptionCombos.length) {
			var overflow = section.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			var numberOfColumnsThatCanFitInThisSection = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newSection = _.cloneDeep(section);
			newSection.categoryCombo.categoryOptionCombos = section.categoryCombo.categoryOptionCombos.splice(numberOfColumnsThatCanFitInThisSection);
			sections.splice(index + 1, 0, newSection)
		}
	};

	this.getDataElementsToDisplay = function(dataElements) {
		if(!config.customAttributes.displayOptionUID) return dataElements;
		return _.filter(dataElements, function(dataElement) {
			if(dataElement.valueType == ValueTypes.OPTIONSET) {
				var displayOptionAttribute = getCustomAttributeForRenderingOptionSets(dataElement.attributeValues);
				if(displayOptionAttribute) {
					return displayOptionAttribute.value != config.customAttributes.displayOptionUID.options.none;
				}
			}
			return true;
		});
	};
	return this;
}]);