TallySheets.factory('RegisterColumn', [function() {
	return function RegisterColumn(name, renderType) {
		this.name = name;
		this.renderType = renderType;
	}
}]);