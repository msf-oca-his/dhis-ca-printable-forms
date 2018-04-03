TallySheets.factory('BooleanField', [function() {
    return function BooleanField(dataElement) {
        this.name = "boolean-field";
        this.displayFormName = dataElement.displayFormName;
        this.valueType = dataElement.valueType;
        this.greyField = dataElement.greyField;
    }
}]);