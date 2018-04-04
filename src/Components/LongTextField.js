TallySheets.factory('LongTextField', ['TextField',function(TextField) {
	return function LongTextField(dataElement, height) {
		this.name = "long-text-field";
		this.displayFormName = dataElement.displayFormName;
		this.valueType = dataElement.valueType;
		this.greyField = dataElement.greyField;
        this.height = height;
	}
}]);