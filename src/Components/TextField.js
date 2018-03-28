TallySheets.factory('TextField', [function() {
	return function TextField(dataElement) {
		this.name = "text-field";
		this.displayFormName = dataElement.displayFormName;
		this.valueType = dataElement.valueType;
		this.greyField = dataElement.greyField;
	}
}]);