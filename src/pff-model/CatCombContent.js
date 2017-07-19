TallySheets.factory('CatCombContent', ['Config', function(config) {

	var addLineBreakAfterEachCategoryOption = function(categoryOptionCombos) {
		return _.map(categoryOptionCombos, function(categoryOptionCombo) {
			return categoryOptionCombo.toString().replace(/,/g, config.Delimiters.categoryOptionComboDelimiter);
		});
	};

	return function CatCombContent(section) {
		if(!section) return;
		this.title = section.displayName;
		this.categoryOptionCombos = addLineBreakAfterEachCategoryOption(section.categoryCombo.categoryOptionCombos);
		this.dataElements = _.map(section.dataElements,function(dataElement) {
				return _.pick(dataElement,['displayFormName','greyedFieldIndexes'])
		});
	}
}]);

