TallySheets.factory('Header', [function() {
	return function Header(height) {
		this.name = 'header';
        this.height = height;
		return this;
	}
}]);