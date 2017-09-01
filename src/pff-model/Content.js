TallySheets.factory('Content', [ function() {
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
		default        : { type: 'DEFAULT', renderer: 'default-content' },
		datasetTitle   : { type: 'DATASET_TITLE', renderer: 'dataset-title' },
		comments       : { type: 'COMMENTS', renderer: 'comments' }
	}
}]);

TallySheets.factory('DefaultContentTypes',[function() {
	return {
		TRUE_ONLY :{renderer:'yes-only'},
		TEXT      :{renderer:'default-type'},
		LONG_TEXT :{renderer:'default-type'},
		NUMBER    :{renderer:'default-type'},
		BOOLEAN   :{renderer:'boolean'}
	}
}]);