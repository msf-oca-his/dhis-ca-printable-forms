TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'LongTextField', 'BooleanField', 'YesOnlyField', 'CommentField', 'OptionLabelField', 'OptionField', 'Section', 'PageComponent', 'PrintFriendlyUtils', 'CatCombProcessor', 'CatCombSection','Footer', function (TemplateTitle, Header, SectionTitle, TextField, LongTextField, BooleanField, YesOnlyField, CommentField, OptionLabelField, OptionField, Section, PageComponent, PrintFriendlyUtils, CatCombProcessor, CatCombSection, Footer) {

    var pages = [];
    var page;
    var templateType;
    var currentTemplate;
    var componentConfig;
    var isFirstSectionInTemplate;
    var addGraceHeight = 0; //extra height that will get added by overflowing option set causes addition of option label increases the height
    var isContinuedCatCombSection = false;

    var getRenderedType = function (type) {
        var types = {
            "LONG_TEXT": "LONG_TEXT",
            "BOOLEAN": "BOOLEAN",
            "TRUE_ONLY": "YES_ONLY",
            "COMMENT": "COMMENT",
            "OPTIONSET": "OPTIONSET"
        };
        return types[type] ? types[type] : "TEXT";
    };

    var addSectionTitle = function (title, section) {
        var titleHeight = componentConfig.components.sectionTitle.height;
        page.components.push(new SectionTitle(title, titleHeight));
        section.left.height = section.left.height - titleHeight;
        section.right.height = section.right.height - titleHeight;
    };

    var addTextField = function (dataElement, section) {
        var textFieldHeight = componentConfig.components.TEXT.height;
        if (section.left.height > 0) {
            section.left.components.push(new TextField(dataElement, textFieldHeight));
            section.left.height -= textFieldHeight;
        } else {
            section.right.components.push(new TextField(dataElement, textFieldHeight));
            section.right.height -= textFieldHeight;
        }
    };

    var addLongTextField = function (dataElement, section) {
        var longTextFieldHeight = componentConfig.components.LONG_TEXT.height;
        if (section.left.height > 0) {
            section.left.components.push(new LongTextField(dataElement, longTextFieldHeight));
            section.left.height -= longTextFieldHeight;
        } else {
            section.right.components.push(new LongTextField(dataElement, longTextFieldHeight));
            section.right.height -= longTextFieldHeight;
        }
    };

    var addBooleanField = function (dataElement, section) {
        var booleanFieldHeight = componentConfig.components.BOOLEAN.height;
        if (section.left.height > 0) {
            section.left.components.push(new BooleanField(dataElement, booleanFieldHeight));
            section.left.height -= booleanFieldHeight;
        } else {
            section.right.components.push(new BooleanField(dataElement, booleanFieldHeight));
            section.right.height -= booleanFieldHeight;
        }
    };

    var addYesOnlyField = function (dataElement, section) {
        var yesOnlyFieldHeight = componentConfig.components.YES_ONLY.height;
        if (section.left.height > 0) {
            section.left.components.push(new YesOnlyField(dataElement, yesOnlyFieldHeight));
            section.left.height -= yesOnlyFieldHeight;
        } else {
            section.right.components.push(new YesOnlyField(dataElement, yesOnlyFieldHeight));
            section.right.height -= yesOnlyFieldHeight;
        }
    };

    var addCommentField = function (dataElement, section) {
        var commentFieldHeight = componentConfig.components.COMMENT.height;
        if (section.left.height > 0) {
            section.left.components.push(new CommentField(dataElement, commentFieldHeight));
            section.left.height -= commentFieldHeight;
        } else {
            section.right.components.push(new CommentField(dataElement, commentFieldHeight));
            section.right.height -= commentFieldHeight;
        }
    };

    var addOptionLabelField = function (dataElement, section) {
        var optionLabelFieldHeight = componentConfig.components.OPTIONSET.optionLabelHeight;
        if (section.left.height > 0) {
            section.left.components.push(new OptionLabelField(dataElement, optionLabelFieldHeight));
            section.left.height -= optionLabelFieldHeight;
        } else {
            section.right.components.push(new OptionLabelField(dataElement, optionLabelFieldHeight));
            section.right.height -= optionLabelFieldHeight;
        }
    };

    var addOptionField = function (dataElement, option, section,index) {
        var optionHeight = componentConfig.components.OPTIONSET.optionHeight;
        var optionLabelFieldHeight = componentConfig.components.OPTIONSET.optionLabelHeight;
        if (section.left.height > 0) {
            section.left.components.push(new OptionField(option, optionHeight));
            section.left.height -= optionHeight;
        } else {
            if((section.right.components.length == 0) && (index == (dataElement.options.length-1)) && ((componentConfig.components.BUFFER.height+section.left.height)>= optionHeight)) {
                section.left.components.push(new OptionField(option, optionHeight));
                section.left.height -= optionHeight;
            }
            else if ((section.right.components.length == 0)) {
                dataElement.displayFormName =(!dataElement.displayFormName.includes("  (Contd....)"))?dataElement.displayFormName + "  (Contd....)":dataElement.displayFormName;
                section.right.components.push(new OptionLabelField(dataElement, optionLabelFieldHeight));
                section.right.components.push(new OptionField(option, optionHeight));
                section.right.height -= optionHeight;
            }
            else {
                section.right.components.push(new OptionField(option, optionHeight));
                section.right.height -= optionHeight;
            }
        }
    };

    var addOptionSetField = function (dataElement, section) {
        addOptionLabelField(dataElement, section);
        _.map(dataElement.options, function (option,index) {
            addOptionField(dataElement, option, section,index);
        });
    };

    var addDataElementToSection = {
        "LONG_TEXT": addLongTextField,
        "BOOLEAN": addBooleanField,
        "YES_ONLY": addYesOnlyField,
        "COMMENT": addCommentField,
        "OPTIONSET": addOptionSetField,
        "TEXT": addTextField
    };

    var predictSectionHeight = function (section, leftHeight) {
        addGraceHeight = 0;
        var overFlowedHeight = leftHeight - componentConfig.components.sectionTitle.height;
        var renderEachDataElement = function (dataElement) {
            var renderEachOption = function () {
                if ((overFlowedHeight + addGraceHeight) > 0) {
                    overFlowedHeight -= componentConfig.components[getRenderedType(dataElement.valueType)].optionHeight;
                }
            };
            if (overFlowedHeight > 0) {
                if (dataElement.valueType == "OPTIONSET") {
                    addGraceHeight = componentConfig.components[getRenderedType(dataElement.valueType)].optionLabelHeight;
                    overFlowedHeight -= componentConfig.components[getRenderedType(dataElement.valueType)].optionLabelHeight;
                    _.map(dataElement.options,renderEachOption);
                } else overFlowedHeight -= (componentConfig.components[getRenderedType(dataElement.valueType)].height);
            }
        };
        _.map(section.dataElements, renderEachDataElement);
        return leftHeight + Math.abs(overFlowedHeight);
    };

    var getHeightOfOptionSet = function (dataElement) {
        var height = 0;
        height += componentConfig.components[getRenderedType(dataElement.valueType)].optionLabelHeight + (componentConfig.components[getRenderedType(dataElement.valueType)].optionLabelHeight * (dataElement.options.length));
        return height;
    };

    var calculateHeightForCurrent = function (section) {
        var height = 0;
        var calculateHeightFor = function (dataElement) {
            if (dataElement.valueType == "OPTIONSET") {
                var optionSetHeight = getHeightOfOptionSet(dataElement);
                height += optionSetHeight;
            } else height += componentConfig.components[getRenderedType(dataElement.valueType)].height;
        };
        _.map(section.dataElements, calculateHeightFor);
        var totalHeight = (height / 2) + componentConfig.components.sectionTitle.height;
        return predictSectionHeight(section, totalHeight);
    };

    var numberOfElementsThatCanFitInGivenHeight = function (section, height, count) {
        var component = {};
        while (count < section.dataElements.length) {
            if (section.dataElements[count].valueType == 'OPTIONSET') {
                if (height >= (componentConfig.components[getRenderedType(section.dataElements[count].valueType)].optionLabelHeight + componentConfig.components[getRenderedType(section.dataElements[count].valueType)].optionHeight)) {
                    height -= componentConfig.components[getRenderedType(section.dataElements[count].valueType)].optionLabelHeight;
                    var options = section.dataElements[count].options;
                    var optionIndex = 0;
                    while (optionIndex < options.length) {
                        if (height >= componentConfig.components[getRenderedType(section.dataElements[count].valueType)].optionHeight) {
                            height -= componentConfig.components[getRenderedType(section.dataElements[count].valueType)].optionHeight;
                            optionIndex++;
                        }
                        else break;
                    }
                    if (optionIndex < section.dataElements[count].options.length) {
                        var newDataElement = _.cloneDeep(section.dataElements[count]);
                        if((optionIndex == (section.dataElements[count].options.length-1)) && ((componentConfig.components.BUFFER.height + height) >= componentConfig.components.OPTIONSET.optionHeight)) {
                                optionIndex -= 1;
                        }
                        newDataElement.options = section.dataElements[count].options.splice(optionIndex);
                        if (!newDataElement.displayFormName.includes("  (Contd....)"))
                            newDataElement.displayFormName = newDataElement.displayFormName + "  (Contd....)";
                        section.dataElements.splice(count + 1, 0, newDataElement);
                    }
                    count++;
                } else break;
            }
            else if (height >= componentConfig.components[getRenderedType(section.dataElements[count].valueType)].height) {
                height -= componentConfig.components[getRenderedType(section.dataElements[count].valueType)].height;
                count++;
            } else break;
        }
        ;
        component.count = count;
        component.overFlowedHeight = height;
        return component;
    };

    var numberOfElementsThatCanFitIn = function (section) {
        var leftPageHeight = page.height - componentConfig.components.sectionTitle.height - addGraceHeight;
        var rightPageHeight = leftPageHeight;
        var leftComponent = numberOfElementsThatCanFitInGivenHeight(section, leftPageHeight, 0);
        var rightPageHeight = rightPageHeight - leftComponent.overFlowedHeight;
        var rightComponent = numberOfElementsThatCanFitInGivenHeight(section, rightPageHeight, leftComponent.count);
        return rightComponent.count;
    };

    var breakAndAddSection = function (section) {
        var numberOfComponentsThatCanFit = CatCombProcessor.isCatCombSection(section) ?
            CatCombProcessor.getNumberOfElementCanFitOnPage(page.height, componentConfig) :
            numberOfElementsThatCanFitIn(section);
        var newSection = _.cloneDeep(section);

        if (CatCombProcessor.isCatCombSection(section)) {
            newSection = CatCombProcessor.getNewSection(section, componentConfig, page.height);
        } else {
            newSection.dataElements = section.dataElements.splice(numberOfComponentsThatCanFit);
        }
        processSection(section);
        
        if (CatCombProcessor.isCatCombSection(section) && CatCombProcessor.getNumberOfElementCanFitOnPage(page.height, componentConfig) > 0) {
            isContinuedCatCombSection = true;
        } else {
            isContinuedCatCombSection = false;
            addNewPage();
            if (!isFirstSectionInTemplate)
                addTitle(currentTemplate.displayName);
        }
        processSection(newSection);
    };

    var isNotEmpty = function (dataElements) {
        return dataElements.length > 0;
    };

    var preCheckToAddTemplateTitle = function (section) {
        if (!isNotEmpty(section.dataElements)) {
            return false;
        }
        var minimumHeight = 0;
        if (CatCombProcessor.isCatCombSection(section))
            minimumHeight = CatCombProcessor.getSingleRowHeightForNewSection(componentConfig) + componentConfig.components.templateTitle.height;
        else
            minimumHeight = componentConfig.components.templateTitle.height + componentConfig.components.sectionTitle.height + componentConfig.components[getRenderedType(section.dataElements[0])].height;
        return page.height >= minimumHeight;
    };

    var addTemplateTitle = function (section) {
        if (isFirstSectionInTemplate) {
            if (preCheckToAddTemplateTitle(section)) {
                addTitle(currentTemplate.displayName);
                isFirstSectionInTemplate = false;
            }
        };
    };

    var processDefaultElements = function (sectionComponent, section) {
        var render = function (dataElement) {
            addDataElementToSection[getRenderedType(dataElement.valueType)](dataElement, sectionComponent)
        };
        if (isNotEmpty(section.dataElements)) {
            addSectionTitle(section.displayName, sectionComponent);
        }
        _.map(section.dataElements, render);
    };

    var addCurrentSectionToPage = function (section, sectionComponent, sectionHeight) {
        (sectionComponent.name === 'cat-comb-section') ?
            CatCombProcessor.processSection(componentConfig, section, sectionComponent, isContinuedCatCombSection) :
            processDefaultElements(sectionComponent, section);
        page.components.push(sectionComponent);
        page.components = _.flattenDeep(page.components);
        page.height = page.height - sectionHeight;
    };

    var addSectionToNewPage = function (section) {
        addNewPage();
        addTitle(currentTemplate.displayName);
        isFirstSectionInTemplate = false;
        isContinuedCatCombSection=false;
        processSection(section);
    };

    var processSection = function (section) {
        addTemplateTitle(section);
        var sectionHeight =
            CatCombProcessor.isCatCombSection(section) ? CatCombProcessor.getHeightFor(section, componentConfig) :
                calculateHeightForCurrent(section);
        var sectionComponent = CatCombProcessor.isCatCombSection(section) ?
            new CatCombSection(sectionHeight) : new Section(sectionHeight);

        var titleHeight = (isFirstSectionInTemplate)?componentConfig.components.templateTitle.height:0;
        if (CatCombProcessor.isCatCombSection(section) && page.height < (CatCombProcessor.getSingleRowHeightForNewSection(componentConfig)+titleHeight)) {
            addSectionToNewPage(section);
        }
        else if (page.height < (componentConfig.components.sectionTitle.height+titleHeight)) {
            addSectionToNewPage(section);
        }
        else if (CatCombProcessor.isCatCombSection(section) && !CatCombProcessor.canOptionFitOnOneRow(section, componentConfig)) {
            breakAndAddSection(section, sectionHeight);
        }
        else if ((sectionHeight+titleHeight) <= page.height) {
            addCurrentSectionToPage(section, sectionComponent, sectionHeight);
        }
        else {
            breakAndAddSection(section, sectionHeight)
        }
    };

    var addHeader = function () {
        var headerHeight;
        headerHeight = (templateType == "DataSet") ? componentConfig.components.header.height : componentConfig.components.header.height / 2;
        page.components.push(new Header(templateType, headerHeight));
        page.height = page.height - headerHeight;
    };

    var addTitle = function (title) {
        var titleHeight = componentConfig.components.templateTitle.height;
        page.components.push(new TemplateTitle(title, titleHeight));
        page.height = page.height - titleHeight;
    };

    var removeBorders = function () {
        page.height = page.height - componentConfig.components.border.top - componentConfig.components.border.bottom;
        page.width = page.width - componentConfig.components.border.left - componentConfig.components.border.right;
    };

    var removeFooterHeight = function () {
        page.height = page.height - componentConfig.components.FOOTER.height;
    };

    var addNewPage = function () {
        page = new PageComponent(componentConfig.height, componentConfig.width);
        pages.push(page);
        removeBorders();
        addHeader();
        removeFooterHeight();
    };

    var removeBuffer = function () {
        page.height = page.height - componentConfig.components.BUFFER.height;
    };

    var isListTypeDataElement = function (dataElement) {
        if ((dataElement.valueType == "OPTIONSET") && (!(PrintFriendlyUtils.isListTypeDataElement(dataElement)) || dataElement.greyField))
            dataElement.valueType = "TEXT";
    };

    var applyDisplayOptionAttributeToDataElementsIn = function (section) {
        section.dataElements = PrintFriendlyUtils.getDataElementsToDisplay(section.dataElements);
        _.map(section.dataElements, isListTypeDataElement);
    };

    var addFooter = function (page, pageNumber, pages) {
        page.components.push(new Footer(componentConfig.components.FOOTER.height, pageNumber + 1, pages.length));
    };

    var processTemplate = function (template) {
        isFirstSectionInTemplate = true;
        currentTemplate = template;
        _.map(template.sections, applyDisplayOptionAttributeToDataElementsIn);
        _.map(template.sections, processSection);
        return pages;
    };

    this.processComponents = function (templates, config) {
        pages = [];
        componentConfig = config;
        templateType = templates[0].constructor.name;
        addNewPage();
        _.map(templates, processTemplate);
        _.forEach(pages,addFooter);
        return pages;
    };
}]);