describe("CatComb Processor", function() {
    var catCombProcessor, DhisConstants, SectionTitle, CatCombField, config;
    var CatCombSection = function() {
        this.name = "cat-comb-section";
        this.height = 200;
        this.components = [];
    };

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("TallySheets");
        config = {
            "height": 297,
            "width": 210,

            "Delimiters": {
                "categoryOptionComboDelimiter": "mm"
            },

            "components": {

                "border": {
                    "top": 15,
                    "left": 15,
                    "bottom": 15,
                    "right": 15
                },

                "header":{
                    "height": 30
                },

                "templateTitle": {
                    "height": 10,
                    "maximumCharLength": 90
                },

                "sectionTitle": {
                    "height": 10
                },

                "TEXT": {
                    "height": 20
                },

                "LONG_TEXT": {
                    "height": 30
                },

                "BOOLEAN": {
                    "height": 30
                },

                "YES_ONLY": {
                    "height": 20
                },

                "COMMENT": {
                    "height":30
                },

                "OPTIONSET": {
                    "height": 20,
                    "optionLabelHeight":10,
                    "optionHeight":10
                },

                "CAT_COMB": {
                    "heightOfCatCombTableHeader": 15,
                    "heightOfDataElement": 12,
                    "widthOfDataElement": 40,
                    "maxNumberOfColumns": 4,
                    "gapBetweenColumns": 10,
                    "gapBetweenSectionAndTable": 4,
                    "widthOfCategoryOptionCombo": 30
                },

                "FOOTER": {
                    "height": 20
                }
            }
        };
        DhisConstants = {
            CategoryComboType: { default: 'default' }
        };
        SectionTitle = function(section) { return { name: 'section-title', section: section }; };
        CatCombField = function(section) { return { name: 'cat-comb-field', section: section }; };

        module(function($provide, $translateProvider) {
            $provide.value('DhisConstants', DhisConstants);
            $provide.value('SectionTitle', SectionTitle);
            $provide.value('CatCombField', CatCombField);
        });

    });

    beforeEach(inject(function(CatCombProcessor) {
        catCombProcessor = CatCombProcessor;
    }));

    describe('Process Category Combination', function () {
        it('should process basic catcob with a single section', function () {
            var catCombSection = {
                sections: [{
                    name: "section",
                    displayName: "section",
                    id: "134",
                    categoryCombo: {
                        id: "154",
                        categoryOptionCombos: ["female<br><12", "male<br><10"],
                        name: "catcomb"
                    },
                    dataElements: [{
                        name: "dataElement",
                        displayFormName: "dataElement",
                        id: "1234",
                        valueType: "TEXT",
                        categoryCombo: {
                            id: "154",
                            categoryOptionCombos: ["female<br><12", "male<br><10"],
                            name: "catcomb"
                        }
                    }],
                    isCatComb: true
                }]
            };
            var section = catCombProcessor.processSection(config, catCombSection.sections[0], new CatCombSection(), false);
            expect(section.components.length).toEqual(2);
            expect(section.components[0].name).toEqual('section-title');
            expect(section.components[1].name).toEqual('cat-comb-field');
        });
    });
    describe('get height for', function () {
        it('should provide height for a section', function () {
            var section = {
                name: "section",
                displayName: "section",
                id: "134",
                categoryCombo: {
                    id: "154",
                    categoryOptionCombos: ["female<br><12", "male<br><10"],
                    name: "catcomb"
                },
                dataElements: [{
                    name: "dataElement",
                    displayFormName: "dataElement",
                    id: "1234",
                    valueType: "TEXT",
                    categoryCombo: {
                        id: "154",
                        categoryOptionCombos: ["female<br><12", "male<br><10"],
                        name: "catcomb"
                    }
                }]
            };
            var height = catCombProcessor.getHeightFor(section, config);
            expect(height).toEqual(41);
            var dataElement = {
                name: "dataElement2",
                displayFormName: "dataElement2",
                id: "1235",
                valueType: "TEXT",
                categoryCombo: {
                    id: "155",
                    categoryOptionCombos: ["female<br><15", "male<br><12"],
                    name: "catcomb"
                }
            };
            section.dataElements.push(dataElement);
            expect(catCombProcessor.getHeightFor(section, config)).toEqual(53);
        });
    });

    describe('get single row height for new section', function () {
        it('should get single row height for a new catcomb section', function () {
            expect(catCombProcessor.getSingleRowHeightForNewSection(config)).toEqual(41);
        });
    });

    describe('is cat comb section', function () {
        it('should give true for a cat comb section', function () {
            var section = {
                name: "section",
                displayName: "section",
                id: "134",
                categoryCombo: {
                    id: "154",
                    categoryOptionCombos: ["female<br><12", "male<br><10"],
                    name: "catcomb"
                },
                dataElements: [{
                    name: "dataElement",
                    displayFormName: "dataElement",
                    id: "1234",
                    valueType: "TEXT",
                    categoryCombo: {
                        id: "154",
                        categoryOptionCombos: ["female<br><12", "male<br><10"],
                        name: "catcomb"
                    }
                }]
            };
            expect(catCombProcessor.isCatCombSection(section)).toBeTruthy();
        });
    });

    describe('getNumberOfElementCanFitOnPage', function () {
        it('should provide the number of element can fit on a page for a section', function () {
            expect(catCombProcessor.getNumberOfElementCanFitOnPage(60, config)).toEqual(2);
            expect(catCombProcessor.getNumberOfElementCanFitOnPage(50, config)).toEqual(1);
            expect(catCombProcessor.getNumberOfElementCanFitOnPage(40, config)).toEqual(0);
        });
    });

    describe('canOptionFitOnOneRow', function () {
        it('should provide status whether options can fit on one row or not', function () {
            var section = {
                categoryCombo: {
                    categoryOptionCombos: ['<5, male', '>5, male', '<5, female', '>5 female', '<10 male', '>10 male']
                }
            };
            expect(catCombProcessor.canOptionFitOnOneRow(section, config)).toBeFalsy();

            section = {
                categoryCombo: {
                    categoryOptionCombos: ['<5, male', '>5, male', '<5, female']
                }
            };
            expect(catCombProcessor.canOptionFitOnOneRow(section, config)).toBeTruthy();
        });
    });

    describe('getNewSection', function () {
        it('should get new section by adding overflowed options and data elements', function () {
            var section = {
                name: "section",
                displayName: "section",
                id: "134",
                categoryCombo: {
                    id: "154",
                    categoryOptionCombos: ["female<br><12", "male<br><10"],
                    name: "catcomb"
                },
                dataElements: [{
                    name: "dataElement",
                    displayFormName: "dataElement",
                    id: "1234",
                    valueType: "TEXT",
                    categoryCombo: {
                        id: "154",
                        categoryOptionCombos: ["female<br><12", "male<br><10"],
                        name: "catcomb"
                    }
                }, {
                    name: "dataElement2",
                    displayFormName: "dataElement2",
                    id: "1235",
                    valueType: "TEXT",
                    categoryCombo: {
                        id: "155",
                        categoryOptionCombos: ["female<br><12", "male<br><10"],
                        name: "catcomb"
                    }
                }]
            };
            var newSection = catCombProcessor.getNewSection(section, config, 50);
            expect(section.dataElements.length).toEqual(1);
            expect(section.categoryCombo.categoryOptionCombos.length).toEqual(2);
            expect(newSection.dataElements.length).toEqual(1);
            expect(newSection.categoryCombo.categoryOptionCombos.length).toEqual(2);
        });
    });
});