TallySheets.factory('Header', [function() {
	return function Header(templateType,height) {
		this.name = 'header';
		this.height = height;
		this.templateType = templateType;
		return this;
	}
}]);