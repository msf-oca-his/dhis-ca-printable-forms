describe("Program controller", function () {
    var $controller;
    var section;
    var $scopeCtrl = {};
    var config = {};
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        config={
            Register:{
                availableHeight: 100,
                availableWidth: 270,
                labelHeight: 10,            //table header
                tableHeaderHeight: 10,           //page header
                dataEntryRowHeight: 20,
                headerHeight: 10,
                textElementWidth: 50,
                otherElementWidth: 30
            },
            DisplayOptions: "testDisplayOptions"
        };
        module(function ($provide) {
            $provide.value('Config', config);
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
        };
        $controller('programCtrl', {$scope: $scopeCtrl})
    });

    it("should get displayOptions from config", function(){
       expect($scopeCtrl.displayOptions).toEqual(config.DisplayOptions)
    });

    describe("get table width", function () {
        it("should return table width as 9.5cm when section is not catcomb", function () {
            expect($scopeCtrl.getTableWidth(section)).toEqual("9.5cm");
        });

        it("should return calculated table width when section is catcomb", function () {
            var currentSection = _.cloneDeep(section);
            currentSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];
            currentSection.isCatComb = true;
            expect($scopeCtrl.getTableWidth(currentSection)).toEqual("10cm");
        });
    });

    describe("get class", function () {
        it("should give de field text type if dataelement type is TEXT", function () {
            var dataElement = { valueType: 'TEXT' };
            expect($scopeCtrl.getClass(dataElement)).toEqual('deField text');
        });

        it("should give de general text type if dataelement type is not TEXT", function () {
            var dataElement = { valueType: 'CatComb' };
            expect($scopeCtrl.getClass(dataElement)).toEqual('deField general');
        });

        it("finding number rows for scope variable", function () {
            expect($scopeCtrl.rows.length).toBe(4);
        })

    });


});