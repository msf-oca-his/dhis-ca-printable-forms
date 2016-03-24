TallySheets.service("ProgramProcessor", [ 'DataElementService', 'DataEntrySectionService', function(DataElementService, DataEntrySectionService){
    var pages = [];
    var currentPageIndex;
    var page;
    var heightOfTableHeader = 15;
    var heightOfDataElementInCatCombTable = 12;
    var heightOfDataElementInGeneralDataElement = 9;
    var heightOfSectionTitle = 7;
    var heightOfDataSetTitle = 10;
    var gapBetweenSections = 5;
    var graceHeight = 10;
    var registerPage = 'register';
    var coverSheetPage = 'coversheet';


    var Page = function (type) {
        var page = {};
        page.heightLeft = (type == coverSheetPage) ? 183 : 150;
        page.widthLeft = (type == coverSheetPage) ? 237 : 270;
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
        var maxDataElementWidth = 185;
        var newSection;

        var getLengthOfOptions = function(dataelement) {
            var optionSetLabelPadding = 4;
            var optionSetLabelLength = 48 + optionSetLabelPadding;
            var optionsPadding = 12;
            var optionsLength = 0;
            _.map(dataelement.options, function(option) {
                optionsLength = optionsLength + optionsPadding + (option.name.length) * 1.8;
            });
            return optionSetLabelLength + optionsLength;
        }

        _.map(section.dataElements, function(dataElement, index){

            if(dataElement.type == 'OPTIONSET') {
                if(getLengthOfOptions(dataElement) < maxDataElementWidth) indexOfDEWithOptions.push(index);
                else dataElement.type = "TEXT";
            }

        });

        if((indexOfDEWithOptions.length == 1)  && (section.dataElements.length == 1)) return;

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
        var numberOfFittingColumns = 5;
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
                page = new Page(coverSheetPage);
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
                    var pageHeightLeft = 1000;
                    newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
                    newSection.isDuplicate = true;
                    processTableHeader(newSection);
                    addSectionToPage(section, pageHeightLeft );
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
                    addSectionToPage(section, 1000);
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
            page = new Page(coverSheetPage);
            pages[++currentPageIndex] = page;
        }
        else {
            page = pages[currentPageIndex];
        }

        _.map(dataSet.stageSections, processSection);

        dataSet.isPrintFriendlyProcessed = true;
    };

    var processRegisterProgram = function (program) {
        var getNewPage = function(){
            page = new Page(registerPage);
            pages[++currentPageIndex] = page;
            return page;
        };

        var getWidthOfDataElement = function(dataElement){
            return (dataElement.type == 'TEXT') ? 50 : 30;
        };

        page = getNewPage();
        var allDataElements = _.flatten(_.map(program.stageSections, 'dataElements'));
        allDataElements.push(DataElementService.getDataElementFromData({name: 'Comments', type: 'TEXT'}))
        _.map(allDataElements ,function(dataElement){
            page.widthLeft = page.widthLeft -  getWidthOfDataElement(dataElement);
            if(page.widthLeft  > 0)
               page.contents.push(dataElement);
            else
               getNewPage().contents.push(dataElement);
        });
        program.isPrintFriendlyProcessed = true;
    };
    this.process = function(program, mode) {
        pages = [];
        currentPageIndex = -1;
        if (mode == 'coversheet')
            _.map([program], function (program) {
                for (var i = 0; i < program.stageSections.length; i++) {
                    if (program.stageSections[i].isCatComb) {
                        divideCatCombsIfNecessary(program.stageSections[i], i, program.stageSections);
                        processTableHeader(program.stageSections[i]);
                    }
                    else {
                        divideOptionSetsIntoNewSection(program.stageSections[i], i, program.stageSections);
                        splitLeftAndRightElements(program.stageSections[i]);
                    }
                }
                processDataSet(program)
            });
        else {

            processRegisterProgram(program);
        }
        return pages;
    }
}]);