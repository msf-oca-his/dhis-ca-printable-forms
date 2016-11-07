TallySheets.factory('DatasetTitle', [ function() {
	return function DatasetTitle(title) {
		if(!title) return;
		this.title = title;
	}
}]);