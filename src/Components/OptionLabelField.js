TallySheets.factory('OptionLabelField', [function() {
    return function OptionLabelField(dataElement, height) {
        this.name = "option-label-field";
        this.displayName = dataElement.displayFormName;
        this.height = height;
    }
}]);