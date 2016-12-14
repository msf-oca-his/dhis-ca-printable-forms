TallySheets.factory('CatCombContent', [ 'Config', function(config) {

	var addLineBreakAfterEachCategoryOption = function(categoryOptionCombos) {
		return _.map(categoryOptionCombos, function(categoryOptionCombo) {
			return categoryOptionCombo.toString().replace(/,/g, config.Delimiters.categoryOptionComboDelimiter);
		});
	};
	
	return function CatCombContent(section) {
		if(!section) return;
		this.title = section.displayName;
		this.categoryOptionCombos = addLineBreakAfterEachCategoryOption(section.dataElements[0].categoryCombo.categoryOptionCombos);
		this.dataElementNames = _.map(section.dataElements, 'displayName');
	}
}]);

