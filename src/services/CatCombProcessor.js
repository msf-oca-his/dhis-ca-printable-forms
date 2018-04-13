TallySheets.service('CatCombProcessor', ['DhisConstants', 'SectionTitle', 'CatCombField', 'Config', function(DhisConstants, SectionTitle, CatCombField, Config) {

    var addCatCombTitle = function (titleHeight, title, section) {
        section.height -= titleHeight;
        return new SectionTitle(title, titleHeight);
    };

    var isDataElementPresent = function (dataElements) {
        return dataElements.length > 0;
    };

    var getHeightForField = function (dataElements, config) {
        return (dataElements.length * config.components.CAT_COMB.heightOfDataElement)
            + config.components.CAT_COMB.gapBetweenSectionAndTable
            + config.components.CAT_COMB.heightOfCatCombTableHeader;
    };

    var getNewSection = function (section, config, pageHeight) {
        var newSection =  _.cloneDeep(section);
        var categoryOptions = addLineBreakAfterEachCategoryOption(section.categoryCombo.categoryOptionCombos);
        var numberOfElementsThatCanFit = getNumberOfElementCanFitOnPage(pageHeight, config);

        if (categoryOptions.length > config.components.CAT_COMB.maxNumberOfColumns) {
            newSection.categoryCombo.categoryOptionCombos = section.categoryCombo.categoryOptionCombos.splice(config.components.CAT_COMB.maxNumberOfColumns);
        } else {
            newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
        }
        return newSection;
    };

    var addLineBreakAfterEachCategoryOption = function(categoryOptionCombos) {
        return _.map(categoryOptionCombos, function(categoryOptionCombo) {
            return categoryOptionCombo.toString().replace(/,/g, Config.Delimiters.categoryOptionComboDelimiter);
        });
    };

    var canOptionFitOnOneRow = function (section, config) {
        var categoryOptions = addLineBreakAfterEachCategoryOption(section.categoryCombo.categoryOptionCombos);
        return categoryOptions.length <= config.components.CAT_COMB.maxNumberOfColumns;
    };

    this.isCatCombSection = function (section) {
        return !!section.categoryCombo && section.categoryCombo.name !== DhisConstants.CategoryComboType.default;
    };

    this.getSingleRowHeightForNewSection = function (config) {
        return config.components.sectionTitle.height
            + config.components.CAT_COMB.gapBetweenSectionAndTable
            + config.components.CAT_COMB.heightOfCatCombTableHeader
            + config.components.CAT_COMB.heightOfDataElement;
    };

    this.getHeightFor = function (section, config) {
        return config.components.CAT_COMB.heightOfDataElement * (section.dataElements.length )
            + config.components.CAT_COMB.heightOfCatCombTableHeader
            + config.components.CAT_COMB.gapBetweenSectionAndTable
            + config.components.sectionTitle.height;
    };

    var getNumberOfElementCanFitOnPage = function (pageHeight, config) {
        var remainingHeight = pageHeight - config.components.sectionTitle.height;
        remainingHeight -= config.components.CAT_COMB.heightOfCatCombTableHeader;
        remainingHeight -= config.components.CAT_COMB.gapBetweenSectionAndTable;
        return Math.floor(remainingHeight / config.components.CAT_COMB.heightOfDataElement);
    };

    this.processSection = function (config, section, sectionComponent, isContinued) {
        if (isDataElementPresent(section.dataElements) && !isContinued) {
            var titleHeight = config.components.sectionTitle.height;
            sectionComponent.components.push(addCatCombTitle(titleHeight, section.displayName, sectionComponent));
        }
        var dataElements = _.map(section.dataElements,function(dataElement) {
            return _.pick(dataElement,['displayFormName','greyedFieldIndexes'])
        });
        var catCombOptions = addLineBreakAfterEachCategoryOption(section.categoryCombo.categoryOptionCombos);

        var height = getHeightForField(dataElements, config);

        sectionComponent.components.push(new CatCombField(height, dataElements, catCombOptions, config.components.CAT_COMB));
        return sectionComponent;
    };

    this.getNewSection = getNewSection;
    this.canOptionFitOnOneRow = canOptionFitOnOneRow;
    this.getNumberOfElementCanFitOnPage = getNumberOfElementCanFitOnPage;
}]);