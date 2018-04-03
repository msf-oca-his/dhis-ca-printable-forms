TallySheets.factory('YesOnlyField', [function() {
    return function BooleanField(dataElement) {
        this.name = "yes-only-field";
        this.displayFormName = dataElement.displayFormName;
        this.valueType = dataElement.valueType;
        this.greyField = dataElement.greyField;
    }
}]);