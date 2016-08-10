TallySheets.factory('Content', [function() {

	var determineType = function(dataElements) {
		if(dataElements[0] && dataElements[0].categoryCombo.name != "default")
			return "CATCOMB";
		else if(dataElements[0].valueType == "OPTIONSET")
			return "OPTIONSET";
		else return "DEFAULT";
	};

	return function Content(contentType, content) {
		if(contentType == "TITLE") {
			this.type = contentType;
			this.title = content;
		}
		else if(contentType == "SECTION") {
			_.assignIn(this, content);
			this.type = determineType(content.dataElements);
		}
	}
}]);