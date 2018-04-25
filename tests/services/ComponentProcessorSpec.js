describe('Component Processor', function () {
    var componentProcessor,
        TemplateTitle,
        Header,
        SectionTitle,
        TextField,
        LongTextField,
        BooleanField,
        YesOnlyField,
        CommentField,
        OptionLabelField,
        OptionField,
        Section,
        PageComponent,
        PrintFriendlyUtils,
        CatCombProcessor,
        CatCombSection,
        Footer,
        config;

    CatCombProcessor = {};
    PrintFriendlyUtils = {
        getDataElementsToDisplay: function (dataElements) {
            return dataElements;
        },
        isListTypeDataElement: function () {
            return true;
        }
    };


        Section = function (height) {
        this.name = "section";
        this.left = {
            height: height,
            components:[]
        };
        this.right = {
            height: height,
            components:[]
        };
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

        TemplateTitle = function(section) { return { name: 'template-title', section: section }; };
        Header = function(section) { return { name: 'header', section: section }; };
        SectionTitle = function(section) { return { name: 'section-title', section: section }; };
        TextField = function(section) { return { name: 'text-field', section: section }; };
        LongTextField = function(section) { return { name: 'long-text-field', section: section }; };
        BooleanField = function(section) { return { name: 'boolean-field', section: section }; };
        YesOnlyField = function(section) { return { name: 'yes-only-field', section: section }; };
        CommentField = function(section) { return { name: 'comment-field', section: section }; };
        OptionLabelField = function(section) { return { name: 'option-label-field', section: section }; };
        OptionField = function(section) { return { name: 'option-field', section: section }; };
        CatCombSection = function(section) { this.name = 'cat-comb-section'; this.components = []; };
        Footer = function(section) { return { name: 'footer', section: section }; };
        PageComponent = function(height, width) { return { height: height, width: width, components: [] } };
        module(function($provide, $translateProvider) {
            $provide.value('TemplateTitle', TemplateTitle);
            $provide.value('Header', Header);
            $provide.value('SectionTitle', SectionTitle);
            $provide.value('Section', Section);
            $provide.value('TextField', TextField);
            $provide.value('LongTextField', LongTextField);
            $provide.value('BooleanField', BooleanField);
            $provide.value('YesOnlyField', YesOnlyField);
            $provide.value('CommentField', CommentField);
            $provide.value('OptionLabelField', OptionLabelField);
            $provide.value('OptionField', OptionField);
            $provide.value('CatCombSection', CatCombSection);
            $provide.value('Footer', Footer);
            $provide.value('PageComponent', PageComponent);
            $provide.value('CatCombProcessor', CatCombProcessor);
            $provide.value('PrintFriendlyUtils', PrintFriendlyUtils);
        });
    });

    beforeEach(inject(function(ComponentProcessor) {
        componentProcessor = ComponentProcessor;
    }));

    describe('Process Components', function () {
        it('should create a page with one data elements', function () {
            var testDataSet = {
                id: "123",
                name: "test dataset",
                displayName: "test dataset",
                sections: [],
                type: "dataset"
            };

            var pages = componentProcessor.processComponents([testDataSet], config);
            expect(pages.length).toEqual(1);
        });

        it('should show two templates on same page', function () {
            PrintFriendlyUtils.isListTypeDataElement = function () {
                return true
            };
            PrintFriendlyUtils.getDataElementsToDisplay = function (dataElements) {
                return dataElements;
            };
            CatCombProcessor.isCatCombSection = function () { return false; };

            var testDataSet = {
                id: "123",
                name: "test dataset",
                displayName: "test dataset",
                sections: [{
                    name: "section",
                    id: "134",
                    dataElements: [{
                        name: "dataElement",
                        id: "1234",
                    }]
                }],
                type: "dataset"
            };

            var testDataSet2 = {
                id: "124",
                name: "test dataset2",
                displayName: "test dataset2",
                sections: [{
                    name: "section1",
                    id: "135",
                    dataElements: [{
                        name: "dataElement1",
                        id: "1235"
                    }]
                }],
                type: "dataset"
            };

            var pages = componentProcessor.processComponents([testDataSet, testDataSet2], config);
            expect(pages.length).toEqual(1);
            expect(pages[0].components[0].name).toEqual('header');
            expect(pages[0].components[1].name).toEqual('template-title');
            expect(pages[0].components[1].section).toEqual('test dataset');
            expect(pages[0].components[2].name).toEqual('section-title');
            expect(pages[0].components[3].name).toEqual('section');
            expect(pages[0].components[3].left.components[0].name).toEqual('text-field');
            expect(pages[0].components[3].left.components[0].section.id).toEqual('1234');
            expect(pages[0].components[4].section).toEqual('test dataset2');
            expect(pages[0].height).toEqual(152);
        });

        it('should create two pages when templates are overflowing', function () {
            config.height = 105;
            var templates = [
                {
                    id: "123",
                    name: "test dataset",
                    displayName: "test dataset",
                    sections: [{
                        name: "section",
                        id: "134",
                        dataElements: [{
                            name: "dataElement",
                            id: "1234",
                        }, {
                            name: "dataElement2",
                            id: "12341",
                        }, {
                            name: "dataElement3",
                            id: "12342",
                        }]
                    }],
                    type: "dataset"
                },
                {
                    id: "124",
                    name: "test dataset2",
                    displayName: "test dataset2",
                    sections: [{
                        name: "section1",
                        id: "135",
                        dataElements: [{
                            name: "dataElement1",
                            id: "1235"
                        }]
                    }],
                    type: "dataset"
                }
            ];
            var pages = componentProcessor.processComponents(templates, config);
            expect(pages.length).toEqual(3);
            expect(pages[0].components[1].section).toEqual('test dataset');
            expect(pages[0].components[3].left.components[0].section.id).toEqual('1234');
            expect(pages[1].components[1].section).toEqual('test dataset');
            expect(pages[0].components[3].right.components[0].section.id).toEqual('12341');
            expect(pages[2].components[1].section).toEqual('test dataset2');
        });
    });

    describe('Processing of Option sets', function () {
        function DataSet(data) {
            _.assign(this,data);
        }
        var templates = [new DataSet({
            id:'1',
            displayName:'testde',
            sections:[{name:'section1', id:'2',
                        dataElements:[{name:"de", displayFormName:'test', id:1, valueType: "OPTIONSET",
                                        options: [{name:"option1", value:10},{name:"option1",value:10}]}]}],
        })];

        CatCombProcessor = {
            isCatCombSection: function () {
                return false;
            }
        };

        it("should render the option sets with option label field and option field as components", function () {
            config.height = 200;
            var pages = componentProcessor.processComponents(templates, config);
            expect(pages[0].components[3].left.components[0].name).toEqual('option-label-field');
            expect(pages[0].components[3].left.components[1].name).toEqual("option-field")
        });

        it("should repeat the option field name when it splits to right component", function () {
            config.height = 200;
            var newTemplates = _.cloneDeep(templates);
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            var pages = componentProcessor.processComponents(newTemplates, config);
            expect(pages[0].components[3].left.components[0].name).toEqual('option-label-field');
            expect(pages[0].components[3].right.components[0].name).toEqual('option-label-field');
        });

        it("option label field name should contain 'includes' when it splits to right component", function () {
            config.height = 200;
            var newTemplates = _.cloneDeep(templates);
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            var pages = componentProcessor.processComponents(newTemplates, config);
            expect(pages[0].components[3].right.components[0].section.displayFormName).toEqual('test  (Contd....)');
        });

        it("should not render the single option set on right component",function () {
            config.height = 200;
            var newTemplates = _.cloneDeep(templates);
            newTemplates[0].sections[0].dataElements[0].options.push({name:"option1", value:10});
            var pages = componentProcessor.processComponents(newTemplates, config);
            expect(pages[0].components[3].left.components.length).toEqual(4);
        });

        it("should add option label field when page breaks happens and also includes 'contd...", function () {
            config.height = 180;
            var newTemplates = _.cloneDeep(templates);
            newTemplates[0].sections =[{id:'section',name:'section',displayFormName:"blah", dataElements:[]}];
            newTemplates[0].sections[0].dataElements.push({displayFormName:"de",id:"1",valueType:"LONG_TEXT"});
            newTemplates[0].sections[0].dataElements.push({displayFormName:"de",id:"1",valueType:"LONG_TEXT"});
            newTemplates[0].sections[0].dataElements.push({displayFormName:"de",id:"1",valueType:"LONG_TEXT"});
            newTemplates[0].sections[0].dataElements.push({name:'blah', displayFormName:"blah",id:"1",valueType:"OPTIONSET",
                                                            options:[{name:"option1", value:10},
                                                                {name:"option1", value:10},
                                                                {name:"option1", value:10},
                                                                {name:"option1", value:10}
                                                            ]});
            var pages = componentProcessor.processComponents(newTemplates, config);
            expect(pages[1].components[3].left.components[0].name).toEqual('option-label-field');
            expect(pages[1].components[3].left.components[0].section.displayFormName).toEqual('blah  (Contd....)');
        });

        describe("DisplayOptionUID custom attribute", function () {
            it("should render option set as text when it is greyed when custom attribute set to list", function () {
                config.height = 180;
                PrintFriendlyUtils.isListTypeDataElement = function () {
                    return true;
                };
                var newTemplates = _.cloneDeep(templates);
                newTemplates[0].sections[0].dataElements[0].greyField = true;
                var pages = componentProcessor.processComponents(newTemplates, config);
                expect(pages[0].components[3].left.components[0].name).toEqual('text-field');
            });

            it("should render as list when option set is not greyed and custom attribute set to list",function () {
                    config.height = 180;
                    PrintFriendlyUtils.isListTypeDataElement = function () {
                        return true;
                    };
                    var newTemplates = _.cloneDeep(templates);
                    newTemplates[0].sections[0].dataElements[0].greyField = false;
                    var pages = componentProcessor.processComponents(newTemplates, config);
                    expect(pages[0].components[3].left.components[0].name).toEqual('option-label-field');
            });

            it("custom attribute should not effect rendering of other data elements", function () {
                config.height = 180;
                PrintFriendlyUtils.isListTypeDataElement = function () {
                    return true;
                };
                var newTemplates = _.cloneDeep(templates);
                newTemplates[0].sections[0].dataElements[0].greyField = false;
                newTemplates[0].sections[0].dataElements[0].valueType = "LONG_TEXT";
                var pages = componentProcessor.processComponents(newTemplates, config);
                expect(pages[0].components[3].left.components[0].name).toEqual('long-text-field');
            })

        });

        describe('Processing Of Cat Comb', function () {
            it('should process section for cat comb', function () {
                var templates = [
                    {
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
                        }]
                    }
                ];
                CatCombProcessor.isCatCombSection = function (section) {
                    return true;
                };

                CatCombProcessor.getHeightFor = function (section) {
                    return 50;
                };

                CatCombProcessor.getSingleRowHeightForNewSection = function(section) {
                    return 45;
                };

                CatCombProcessor.processSection = function (config, section, sectionComponent) {
                    sectionComponent.components.push({ name: 'cat-comb-field' });
                };

                CatCombProcessor.canOptionFitOnOneRow = function () { return true; };

                PrintFriendlyUtils.getDataElementsToDisplay = function (dataElements) {
                    return dataElements;
                };

                var pages = componentProcessor.processComponents(templates, config);
                expect(pages.length).toEqual(1);
                expect(pages[0].height).toEqual(172);
                expect(pages[0].components[2].name).toEqual('cat-comb-section');
                expect(pages[0].components[2].components[0].name).toEqual('cat-comb-field');
            });
        });

    })
});