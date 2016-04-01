TallySheets.service("ProgramProcessor", [ 'DataElementService', 'DataEntrySectionService','Config', function(DataElementService, DataEntrySectionService, config){
    var pages = [];
    var currentPageIndex;
    var page;
    var registerPage = 'register';
    var coverSheetPage = 'coversheet';


    var Page = function (type) {
        var page = {};
        page.heightLeft = (type == coverSheetPage) ? config.DataSet.availableHeight : config.Register.availableHeight - config.Register.headerHeight;
        page.widthLeft = (type == coverSheetPage) ?  config.DataSet.availableWidth : config.Register.availableWidth;
        page.contents = [];
        return page;
    };
    var processTableHeader = function(section){
        _.map(section.dataElements[0].categoryCombo.categoryOptionCombos, function(categoryOptionCombo, index, arr){
            arr[index] = categoryOptionCombo.replace(/,/g, "<br>");
        });
    };

    var divideOptionSetsIntoNewSection = function(section, index, sections){
        var indexOfDEWithOptions = [];
        var currentIndex = 0;
        var pushIndex = 0;
        var newSection;

        var simplifySection = function(section) {
            var dataElement = section.dataElements[0];
            dataElement.rows = [];
            var rowIndex = -1;
            for(var i=0;i<dataElement.options.length;i++){
                if(i % 3 != 0){
                    dataElement.rows[rowIndex].push(dataElement.options[i])
                }
                else{
                    dataElement.rows.push([dataElement.options[i]]);
                    rowIndex++;
                }
            }
            return section;
        };

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
                    height = config.DataSet.heightOfDataElementInCatCombTable * (section.dataElements.length ) + config.DataSet.heightOfTableHeader + config.DataSet.gapBetweenSections;
                else if (section.isOptionSet)
                    height = config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements[0].rows.length)) + config.DataSet.gapBetweenSections;
                else
                    height =  config.DataSet.heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + config.DataSet.gapBetweenSections;

                return section.isDuplicate ? height : height + config.DataSet.heightOfSectionTitle;
            };

            var addSectionToPage = function (section, height) {
                var isFirstSection = Number.isInteger(sectionIndex) ? ( sectionIndex == 0 ) : sectionIndex;
                if (isFirstSection == true && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
                page.contents.push({type: 'section', section: section});
                page.heightLeft = page.heightLeft - height;
            };

            var addSectionToNewPage = function (section, height, isFirstSectionInDataSet) {
                page = new Page(coverSheetPage);
                page.programName = dataSet.name;
                pages[++currentPageIndex] = page;
                section.isDuplicate = false;
                processSection(section, isFirstSectionInDataSet);
            };

            var getNumberOfElementsThatCanFit = function (section) {
                var overFlow = sectionHeight - page.heightLeft;
                if (section.isCatComb)
                    return section.dataElements.length - Math.round(overFlow / config.DataSet.heightOfDataElementInCatCombTable);
                else if(section.isOptionSet)
                    return section.dataElements[0].options.length - Math.round(overFlow * 3 / (config.DataSet.heightOfDataElementInGeneralDataElement));
                else
                    return section.dataElements.length - Math.round(overFlow * 2 / (config.DataSet.heightOfDataElementInGeneralDataElement));
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
                else if(section.isOptionSet){
                    var newSection = _.cloneDeep(section);
                    if(numberOfElementsThatCanFit % 3 > 0)
                        numberOfElementsThatCanFit = numberOfElementsThatCanFit + (3 - numberOfElementsThatCanFit % 3);
                    newSection.dataElements[0].options = section.dataElements[0].options.splice(numberOfElementsThatCanFit);
                    divideOptionSetsIntoNewSection(section);
                    divideOptionSetsIntoNewSection(newSection);
                    newSection.isDuplicate = true;
                    addSectionToPage(section, page.heightLeft);
                    addSectionToNewPage(newSection, getHeightForSection(newSection), false);
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

            var sectionHeight = (sectionIndex == 0) ? getHeightForSection(section) + config.DataSet.heightOfDataSetTitle : getHeightForSection(section);
            var overflow = sectionHeight - page.heightLeft;
            if (overflow < 0)
                addSectionToPage(section, sectionHeight);
            else if (overflow < config.DataSet.graceHeight)
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

        var addComments = function(){
            var lastPage = pages[pages.length - 1];
            if(lastPage.heightLeft > 30)
                lastPage.contents.push({type: 'comments'});
            else {
                var newPage = new Page(coverSheetPage);
                newPage.contents.push({type: 'comments'});
                pages.push(newPage);
            }

        };

        if (!pages[currentPageIndex]) {
            page = new Page(coverSheetPage);
            page.programName = dataSet.name;
            pages[++currentPageIndex] = page;
        }
        else {
            page = pages[currentPageIndex];
        }

        _.map(dataSet.stageSections, processSection);
        addComments();
        dataSet.isPrintFriendlyProcessed = true;
    };

    var processRegisterProgram = function (program) {
        var getNewPage = function(){
            page = new Page(registerPage);
            page.programName = program.name;
            pages[++currentPageIndex] = page;
            return page;
        };

        var getWidthOfDataElement = function(dataElement){
            return (dataElement.type == 'TEXT') ? config.Register.textElementWidth : config.Register.otherElementWidth;
        };

        page = getNewPage();
        var allDataElements = _.flatten(_.map(program.stageSections, 'dataElements'));
        allDataElements.push(DataElementService.getDataElementFromData({name: 'Comments', type: 'TEXT'}))
        _.map(allDataElements ,function(dataElement){
            page.widthLeft = page.widthLeft -  getWidthOfDataElement(dataElement);
            if(page.widthLeft  > 0) {
                page.contents.push(dataElement);
            }
            else {
                getNewPage();
                page.widthLeft = page.widthLeft -  getWidthOfDataElement(dataElement);
                page.contents.push(dataElement);
            }
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