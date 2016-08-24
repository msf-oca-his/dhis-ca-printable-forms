TallySheets.factory('Content', [function() {

	var determineType = function(dataElements) {
		if(dataElements[0] && dataElements[0].categoryCombo.name != "default")
			return "CATCOMB";
		else if(dataElements[0].valueType == "OPTIONSET")
			return "OPTIONSET";
		else return "DEFAULT";
	};

	return function Content(contentType, data) {
		this.type = contentType;
		this.data = data;
	}
}]);

TallySheets.factory('ContentTypes', [function() {
	return {
		registerContent: { type: 'REGISTER_CONTENT', renderer: 'register-content' },
		optionSet      : { type: 'OPTIONSET', renderer: 'list' },
		catComb        : { type: 'CATCOMB', renderer: 'category-combo' },
		default        : { type: 'DEFAULT', renderer: 'text-field' },
		title          : { type: 'TITLE', renderer: 'section-title' },
		comments       : { type: 'COMMENTS', renderer: 'comments' }
	}
}]);