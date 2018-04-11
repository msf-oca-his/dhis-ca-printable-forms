TallySheets.factory('OptionField', [function() {
    return function OptionField(option, height) {
        this.name = "option-field";
        this.displayName = option.displayName;
        this.height = height;
    }
}]);