TallySheets.factory('CatCombField', [function() {
    return function CatCombField(height, dataElements, catCombOptions, config) {
        this.name = "cat-comb-field";
        this.height = height;
        this.dataElements = dataElements;
        this.catCombOptions = catCombOptions;
        this.config = config;
    }
}]);