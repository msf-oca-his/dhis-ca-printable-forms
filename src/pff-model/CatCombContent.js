TallySheets.factory('CatCombContent', [ function() {
	return function CatCombContent(section) {
		if(!section) return;
		this.title = section.name;
		this.categoryOptionCombos = addLineBreakAfterEachCategoryOption(section.dataElements[0].categoryCombo.categoryOptionCombos);
		this.dataElementNames = _.map(section.dataElements, 'name');
	}
}]);

var addLineBreakAfterEachCategoryOption = function(categoryOptionCombos) {
	return _.map(categoryOptionCombos, function(categoryOptionCombo) {
		return categoryOptionCombo.toString().replace(/,/g, "<br>");
	});
};
