TallySheets.factory('CommonUtils', [ function() {

	this.getRightPartOfSplit = function(string, delimiter) {
		return string.slice(string.indexOf(delimiter) + 1);
	};
	return this;
}]);