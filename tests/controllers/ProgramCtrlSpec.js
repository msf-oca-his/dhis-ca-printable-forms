describe("Program controller", function () {
    var $controller;
    var section;
    var $scopeCtrl = {};
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve({}));
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
            var dataElement = {
                type: 'TEXT'
            };
            expect($scopeCtrl.getClass(dataElement)).toEqual('deField text');
            ;
        });

        it("should give de general text type if dataelement type is not TEXT", function () {
            var dataElement = {
                type: 'CatComb'
            };
            expect($scopeCtrl.getClass(dataElement)).toEqual('deField general');
            ;
        });

        it("finding number rows for scope variable", function () {
            expect($scopeCtrl.rows.length).toEqual(15);
        })

    });


});