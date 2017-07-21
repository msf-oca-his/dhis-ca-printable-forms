TallySheets.factory('PrintFriendlyUtils', ['Config', 'DhisConstants', function(config, DhisConstants) {
	var PrintFriendlyUtils = {};
	var isListTypeDataElement = function(dataElement) {
		if(dataElement.valueType != DhisConstants.ValueTypes.OPTIONSET) return false;
		if(!config.customAttributes.displayOptionUID) return true;
		var displayOptionAttribute = PrintFriendlyUtils.getCustomAttribute(dataElement.attributeValues, "displayOptionUID");
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

	PrintFriendlyUtils.getCustomAttribute = function(customAttributes, customAttributeToFilter) {
		return _.reduce(_.filter(customAttributes, function(customAttribute) {
			if(customAttribute.attribute.id == config.customAttributes[customAttributeToFilter].id) {
				return customAttribute;
			}
		}));
	};

	PrintFriendlyUtils.createNewSectionUsing = function(section, dataElements, dataElementsKey) {
		var newSection = _.cloneDeep(section);
		newSection[dataElementsKey] = dataElements;
		return newSection;
	};

	PrintFriendlyUtils.isDuplicateSection = function(sectionIndex, sections) {
		if(sectionIndex == 0) return false;
		return sections[sectionIndex].id == sections[sectionIndex - 1].id;
	};

	PrintFriendlyUtils.divideOptionSetsIntoNewSections = function(sections, index, dataElementsKey) {
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

	PrintFriendlyUtils.isOptionSetSection = function(section, dataElementsKey) {
		return section[dataElementsKey][0] && isListTypeDataElement(section[dataElementsKey][0]);
	};

	PrintFriendlyUtils.divideCatCombsIfNecessary = function(sections, index) {
		var section = sections[index];
		var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;

		if(numberOfFittingColumns < section.categoryCombo.categoryOptionCombos.length) {
			var overflow = section.categoryCombo.categoryOptionCombos.length - numberOfFittingColumns;
			var numberOfColumnsThatCanFitInThisSection = (overflow > 1) ? numberOfFittingColumns : numberOfFittingColumns - 1;
			var newSection = _.cloneDeep(section);
			newSection.categoryCombo.categoryOptionCombos = section.categoryCombo.categoryOptionCombos.splice(numberOfColumnsThatCanFitInThisSection);
			_.map(newSection.dataElements, function(dataElement){
				dataElement.greyedFieldIndexes = _.map(dataElement.greyedFieldIndexes, function(greyedFieldIndex) {
					return greyedFieldIndex - numberOfColumnsThatCanFitInThisSection;
				});
			});
			sections.splice(index + 1, 0, newSection)
		}
	};

	PrintFriendlyUtils.getDataElementsToDisplay = function(dataElements) {
		if(!config.customAttributes.displayOptionUID) return dataElements;
		var getOptionSetDataElements = function(dataElement) {
			if(dataElement.valueType == DhisConstants.ValueTypes.OPTIONSET) {
				var displayOptionAttribute = PrintFriendlyUtils.getCustomAttribute(dataElement.attributeValues,"displayOptionUID");
				if(displayOptionAttribute) {
					return displayOptionAttribute.value != config.customAttributes.displayOptionUID.options.none;
				}
			}
			return true;
		};
		return _.filter(dataElements, getOptionSetDataElements);
	};
	return PrintFriendlyUtils;
}]);