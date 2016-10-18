TallySheets.factory('Content', [function() {
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

TallySheets.factory('CodeSheet', [function() {
	return function CodeSheet(code, label, type) {
		this.code = code;
		this.label = label;
		this.type = type;
	}
}]);