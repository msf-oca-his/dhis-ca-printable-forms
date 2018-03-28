TallySheets.factory('TemplateTitle', [function() {
	return function TemplateTitle(title) {
		this.name = 'template-title';
		if(!title) return;
		this.title = title;
	}
}]);