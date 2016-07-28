describe("Dataset ctrl", function () {
    var $controller;
    var section;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        module(function ($provide) {
            $provide.value('Config', {});
        });
    });


    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        section = {
            dataElements: [{
                id: "1234",
                isResolved: Promise.resolve({}),
                name: "dataElement",
                type: "TEXT",
                categoryCombo: {}
            }],
            id: "134",
            isResolved: Promise.resolve({}),
            name: "section"
        }
    });

    it("should return table width as 9.5cm when section is not catcomb", function () {
        var $scope = {};
        var datasetCtrl = $controller('datasetCtrl', {$scope: $scope});
        expect($scope.getTableWidth(section)).toEqual("9.5cm");
    });

    it("should return calculated table width when section is catcomb", function () {
        var currentSection = _.cloneDeep(section);
        currentSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"]
        var $scope = {};
        currentSection.isCatComb = true;
        var datasetCtrl = $controller('datasetCtrl', {$scope: $scope});
        expect($scope.getTableWidth(currentSection)).toEqual("10cm");
    });


});