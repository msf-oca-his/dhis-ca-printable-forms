TallySheets.service("PrintFriendlyProcessor", [ 'DataElementService', 'DataEntrySectionService', 'Config', function(DataElementService, DataEntrySectionService, config){
    var pages = [];
    var currentPageIndex;
    var page;
    var heightOfTableHeader = config.DataSet.heightOfTableHeader;
    var heightOfDataElementInCatCombTable = config.DataSet.heightOfDataElementInCatCombTable;
    var heightOfDataElementInGeneralDataElement = config.DataSet.heightOfDataElementInGeneralDataElement;
    var heightOfSectionTitle = config.DataSet.heightOfSectionTitle;
    var heightOfDataSetTitle = config.DataSet.heightOfDataSetTitle;
    var gapBetweenSections = config.DataSet.gapBetweenSections;
    var graceHeight = config.DataSet.graceHeight;

    var Page = function () {
        var page = {};
        page.heightLeft = config.DataSet.availableHeight;
        page.width = config.DataSet.availableWidth;
        page.contents = [];
        return page;
    };

    var processTableHeader = function(section){
        _.map(section.dataElements[0].categoryCombo.categoryOptionCombos, function(categoryOptionCombo){
            categoryOptionCombo.name = categoryOptionCombo.name.replace(/,/g, "<br>");
        })
    };

    var divideOptionSetsIntoNewSection = function(section, index, sections){
        var indexOfDEWithOptions = [];
        var currentIndex = 0;
        var pushIndex = 0;
        var maxDataElementWidth = config.DataSet.availableWidth;
        var newSection;

        var simplifySection = function(section) {
            var optionSetLabelPadding = config.OptionSet.labelPadding;
            var optionSetLabelLength = config.OptionSet.dataElementLabel + optionSetLabelPadding;
            var optionsPadding = config.OptionSet.optionsPadding;


            var optionsLength = optionSetLabelLength;
            var dataElement = section.dataElements[0];
            dataElement.rows = [];
            var rowIndex = 0;
            dataElement.rows[rowIndex] = [];
            for(var i=0;i<dataElement.options.length;i++){
                optionsLength = optionsLength + optionsPadding + (dataElement.options[i].name.length) * 1.8;
                if(optionsLength < maxDataElementWidth){
                    dataElement.rows[rowIndex].push(dataElement.options[i])
                }
                else{
                    optionsLength = optionSetLabelLength + optionsPadding + (dataElement.options[i].name.length) * 1.8;
                    dataElement.rows.push([dataElement.options[i]]);
                    rowIndex++;
                }
            }
            return section;
        }

        _.map(section.dataElements, function(dataElement, index){

              if(dataElement.type == 'OPTIONSET') {
                  indexOfDEWithOptions.push(index);
              }
        });
        if((indexOfDEWithOptions.length == 1)  && (section.dataElements.length == 1)){
            section = simplifySection(section)
            section.isOptionSet = true;
            return ;
        }

        var pushSection = function(section){
            if(section.dataElements.length > 0) sections.splice(index + (++pushIndex), 0, section);
        };



        var cloneSection = function (section, dataElements) {
            var newSection = _.cloneDeep(section);
            newSection.isDuplicate = true;
            newSection.dataElements = dataElements;
            return newSection;
        };

        _.map(indexOfDEWithOptions, function(indexOfDE){
            newSection = cloneSection(section, _.slice(section.dataElements, currentIndex, indexOfDE));
            pushSection(newSection);
            newSection = cloneSection(section, [section.dataElements[indexOfDE]]);
            newSection = simplifySection(newSection);
            newSection.isOptionSet = true;
            pushSection(newSection);
            currentIndex = indexOfDE + 1;
        });

        if(indexOfDEWithOptions.length > 0){
            newSection = cloneSection(section, _.slice(section.dataElements, currentIndex, section.dataElements.length));
            pushSection(newSection);
            sections.splice(index, 1);
            sections[index].isDuplicate = false;
        }
    };
    var divideCatCombsIfNecessary = function (section, index, sections) {
        var dataElement = section.dataElements[0];
        var numberOfFittingColumns = config.DataSet.numberOfCOCColumns;
        if (numberOfFittingColumns < dataElement.categoryCombo.categoryOptionCombos.length) {
            var newDataElements = [];
            _.map(section.dataElements, function (dataElement) {
                var data = _.cloneDeep(dataElement);
                data.categoryCombo.categoryOptionCombos.splice(0, numberOfFittingColumns);
                newDataElements.push(DataElementService.getDataElementFromData(data));
                dataElement.categoryCombo.categoryOptionCombos.splice(numberOfFittingColumns);
            });
            var sectionData = _.cloneDeep(section)
            sectionData.isDuplicate = true;
            sectionData.dataElements = newDataElements;
            sections.splice(index + 1, 0, DataEntrySectionService.getSectionFromData(sectionData))
        }

    };

    var splitLeftAndRightElements = function (section) {
        section.leftSideElements = _.slice(section.dataElements, 0, Math.ceil(section.dataElements.length / 2));
        section.rightSideElements = _.slice(section.dataElements, Math.ceil(section.dataElements.length / 2));
    };


    var processDataSet = function (dataSet) {

        var processSection = function(section, sectionIndex){

            var getHeightForSection = function (section) {
                var height;
                if (section.isCatComb)
                    height = heightOfDataElementInCatCombTable * (section.dataElements.length ) + heightOfTableHeader + gapBetweenSections;
                else {
                    //#TODO: check if dataElement is of type option combo;
                    height =  heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + gapBetweenSections;
                }
                return section.isDuplicate ? height : height + heightOfSectionTitle;
            };

            var addSectionToPage = function (section, height) {
                var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
                if (isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
                page.contents.push({type: 'section', section: section});
                page.heightLeft = page.heightLeft - height;
            };

            var addSectionToNewPage = function (section, height, isFirstSectionInDataSet) {
                page = new Page();
                page.datasetName = dataSet.name;
                pages[++currentPageIndex] = page;
                section.isDuplicate = false;
                processSection(section, isFirstSectionInDataSet);
            };

            var getNumberOfElementsThatCanFit = function (section) {
                var overFlow = sectionHeight - page.heightLeft;
                if (section.isCatComb)
                    return section.dataElements.length - Math.round(overFlow / heightOfDataElementInCatCombTable);
                else
                    return section.dataElements.length - Math.round(overFlow * 2 / (heightOfDataElementInGeneralDataElement));
            };
            var breakAndAddSection = function(section){
                if (section.isCatComb) {
                    var newSection = _.cloneDeep(section);
                    newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
                    newSection.isDuplicate = true;
                    processTableHeader(newSection);
                    addSectionToPage(section, page.heightLeft );
                    var isFirstSectionInDataSet = false;
                    addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
                }
                else {
                    var newSection = _.cloneDeep(section);
                    (numberOfElementsThatCanFit % 2 == 0) ? 0 : ++numberOfElementsThatCanFit;
                    newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
                    splitLeftAndRightElements(section);
                    splitLeftAndRightElements(newSection);
                    newSection.isDuplicate = true;
                    addSectionToPage(section, page.heightLeft);
                    var isFirstSectionInDataSet = false;
                    addSectionToNewPage(newSection, getHeightForSection(newSection), isFirstSectionInDataSet);
                }
            };

            var sectionHeight = (sectionIndex == 0) ? getHeightForSection(section) + heightOfDataSetTitle : getHeightForSection(section);
            var overflow = sectionHeight - page.heightLeft;
            if (overflow < 0)
                addSectionToPage(section, sectionHeight);
            else if (overflow < graceHeight)
                addSectionToPage(section, sectionHeight);
            else {
                var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section)

                if (numberOfElementsThatCanFit == section.dataElements.length)
                    addSectionToPage(section, sectionHeight);
                else if(numberOfElementsThatCanFit > 1)
                    breakAndAddSection(section);
                else{
                    var isFirstSectionInDataSet = sectionIndex == 0;
                    addSectionToNewPage(section, sectionHeight, isFirstSectionInDataSet)
                }
            }
        };

        if (!pages[currentPageIndex]) {
            page = new Page();
            page.datasetName = dataSet.name;
            pages[currentPageIndex] = page;
        }
        else {
            page = pages[currentPageIndex];
        }
        _.map(dataSet.sections, processSection);

        dataSet.isPrintFriendlyProcessed = true;
    };

    this.process = function(dataset) {
        pages = [];
        currentPageIndex = 0;
        _.map([dataset], function (dataset) {
            for(var i = 0; i < dataset.sections.length; i++){
                if(dataset.sections[i].isCatComb) {
                    divideCatCombsIfNecessary(dataset.sections[i], i, dataset.sections);
                    processTableHeader(dataset.sections[i]);
                }
                else {
                    divideOptionSetsIntoNewSection(dataset.sections[i], i, dataset.sections);
                    splitLeftAndRightElements(dataset.sections[i]);
                }
            }
            processDataSet(dataset)
        });
        return pages;
    }
}]);