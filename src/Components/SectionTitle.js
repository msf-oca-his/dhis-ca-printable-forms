TallySheets.factory('SectionTitle', [function() {
	return function SectionTitle(title) {
		this.name = 'section-title';
		if(!title) return;
		this.title = title;
	}
}]);