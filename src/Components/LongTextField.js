TallySheets.factory('LongTextField', ['TextField',function(TextField) {
	return function LongTextField(dataElement) {
		this.name = "long-text-field";
		this.displayFormName = dataElement.displayFormName;
		this.valueType = dataElement.valueType;
		this.greyField = dataElement.greyField;
	}
}]);