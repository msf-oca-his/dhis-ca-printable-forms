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
        Footer;

    CatCombProcessor = {};


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
        CatCombSection = function(section) { return { name: 'cat-comb-section', section: section }; };
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
            console.log(pages);
            expect(pages.length).toEqual(1);
        });
    });
});