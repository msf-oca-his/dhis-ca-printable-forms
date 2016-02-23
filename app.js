var TallySheets = angular.module('TallySheets', ['ngResource', 'pascalprecht.translate']);

var dhisUrl = "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

TallySheets.controller('TallySheetsController', ["$scope", "DataSetsUID", "DataSetEntryForm", "DataSetService", "DataElementService", "DataEntrySectionService", function ($scope, DataSetsUID, DataSetEntryForm, DataSetService, DataElementService, DataEntrySectionService) {

    var dsSelectorLastId = -1;
    $scope.dsSelectorList = [];
    $scope.pages = [];
    var pages = [];
    var currentPageIndex = 0;

    $scope.exportToTable = function (tableId) {
        var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' +
            '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}' +
            '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>' +
            '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
            , base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        }
            , format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        }

        var table = $("#" + tableId).clone();

        // Remove non-printable section from the table
        table.find(".hidden-print").remove();

        // Replace input fields with their values (for correct excel formatting)
        table.find("input").each(function () {
            var value = $(this).val();
            $(this).replaceWith(value);
        });

        // Add border to section table (for printing in MS Excel)
        table.find(".sectionTable").prop('border', '1');

        // Take the name of the first dataset as filename
        var name = table.find("h2").first().html() + '.xls';

        var ctx = {worksheet: 'MSF-OCBA HMIS' || 'Worksheet', table: table.html()}

        // Create a fake link to download the file
        var link = angular.element('<a class="hidden" id="idlink"></a>');
        link.attr({
            href: uri + base64(format(template, ctx)),
            target: '_blank',
            download: name
        });
        $("body").prepend(link[0].outerHTML);
        $("#idlink")[0].click();
        $("#idlink")[0].remove();

    };

    $scope.goHome = function () {
        window.location.replace(dhisUrl);
    };

    // Initialize the app with one dataset selector


    var Page = function () {
        var page = {};
        page.heightLeft = 260;
        page.width = 183;
        page.contents = [];
        return page;
    };

    var fitSection = function (section, index, sections) {
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

    var divideCatCombsIfNecessary = function (sections) {
        var sectionsLength = 0;
        while (sections.length != sectionsLength) {
            sectionsLength = sections.length;
            _.map(sections, function (section, index) {
                if (section.isCatComb)
                    fitSection(section, index, sections);
            })
        }
    };

    var splitLeftAndRightElementsIfNecessary = function (sections) {
        _.map(sections, function (section) {
            if (section.isCatComb)
                return;
            section.leftSideElements = [];
            section.rightSideElements = [];

            _.forEach(section.dataElements, function (dataElement, index, dataElements) {
                if (index < dataElements.length / 2)
                    section.leftSideElements.push(dataElement);
                else
                    section.rightSideElements.push(dataElement);
            });
        })

    };

    var renderDataSet = function (dataSet) {
        var page;
        var heightOfTableHeader = 12;
        var heightOfDataElementInCatCombTable = 12;
        var heightOfDataElementInGeneralDataElement = 9;
        var heightOfSectionTitle = 6;
        if (!pages[currentPageIndex]) {
            page = new Page();
            pages[currentPageIndex] = page;
        }
        else {
            page = pages[currentPageIndex];
        }

        _.map(dataSet.sections, function (section, sectionIndex) {
            var sectionHeight;
            var heightOfDataSetTitle = 8;
            var gapBetweenSections = 5;
            var getHeightForSection = function (section) {
                if (section.isCatComb)
                    if (section.isDuplicate)
                        return heightOfDataElementInCatCombTable * (section.dataElements.length ) + heightOfTableHeader + gapBetweenSections;
                    else
                        return heightOfDataElementInCatCombTable * (section.dataElements.length ) + heightOfTableHeader + heightOfSectionTitle + gapBetweenSections;
                else {
                    //#TODO: check if dataElement is of type option combo;
                    return heightOfDataElementInGeneralDataElement * (Math.ceil(section.dataElements.length / 2)) + heightOfSectionTitle + gapBetweenSections;
                }

            };
            var addSectionToPage = function (section, height) {
                if (sectionIndex == 0 && !section.isDuplicate) page.contents.push({type: 'dataSetName', name: dataSet.name});
                page.contents.push({type: 'section', section: section});
                page.heightLeft = page.heightLeft - height;
            };
            var addSectionToNewPage = function (section, height) {
                page = new Page();
                pages[++currentPageIndex] = page;
                addSectionToPage(section, height);
            };

            var getNumberOfElementsThatCanFit = function (section) {
                var overFlow = sectionHeight - page.heightLeft;
                if (section.isCatComb)
                    return section.dataElements.length - Math.round(overFlow / heightOfDataElementInCatCombTable);
                else
                    return section.dataElements.length - Math.round(overFlow / (heightOfDataElementInGeneralDataElement));
            };

            if (sectionIndex == 0)
                sectionHeight = getHeightForSection(section) + heightOfDataSetTitle;
            else
                sectionHeight = getHeightForSection(section);

            if (page.heightLeft >= sectionHeight)
                addSectionToPage(section, sectionHeight);

            else {

                var numberOfElementsThatCanFit = getNumberOfElementsThatCanFit(section)
                if (numberOfElementsThatCanFit == section.dataElements.length){
                    addSectionToPage(section, sectionHeight);
                }
                else if(numberOfElementsThatCanFit > 1) {

                    if (section.isCatComb) {
                        var newSection = _.cloneDeep(section)
                        newSection.dataElements = section.dataElements.splice(numberOfElementsThatCanFit);
                        newSection.isDuplicate = true;
                        addSectionToPage(section, 1000);
                        addSectionToNewPage(newSection, getHeightForSection(newSection));
                    }
                    else {
                        var newSection = _.cloneDeep(section)
                        newSection.leftSideElements = section.leftSideElements.splice(numberOfElementsThatCanFit / 2);
                        newSection.rightSideElements = section.rightSideElements.splice(numberOfElementsThatCanFit / 2);
                        newSection.isDuplicate = true;
                        addSectionToPage(section, 1000);
                        addSectionToNewPage(newSection, getHeightForSection(newSection));
                    }
                }
                else
                    addSectionToNewPage(section, sectionHeight)
            }

        });
        dataSet.isPrintFriendlyProcessed = true;
    };

    var prettifySections = function (sections) {
        divideCatCombsIfNecessary(sections);
        splitLeftAndRightElementsIfNecessary(sections);
    };
    var renderDataSets = function () {
        $scope.pages = [];
        pages = [];
        currentPageIndex = 0;
        var datasets = new Array($scope.dsSelectorList.length - 1);
        var promises = _.map($scope.dsSelectorList, function (dsSelector, index) {
            if (dsSelector.dataset.id)
                return DataSetService.getDataSet(dsSelector.dataset.id)
                    .then(function (dataset) {
                        return dataset.isResolved
                            .then(function () {
                                return datasets[index] = _.cloneDeep(dataset);
                            });
                    });
            else return Promise.resolve(0)
        });
        Promise.all(promises).then(function () {
            _.map(datasets, function (dataset) {
                prettifySections(dataset.sections);
                renderDataSet(dataset);
            })
            $scope.pages = pages;
            console.log($scope.pages);
            $scope.$apply();
        });
    };


    $scope.addDatasetSelector = function () {
        dsSelectorLastId++;
        $scope.dsSelectorList.push({id: dsSelectorLastId, dataset: {}});
        renderDataSets();
    };

    $scope.deleteDatesetSelector = function (selectPosition) {
        $scope.dsSelectorList.splice(selectPosition, 1);
        renderDataSets();
    };

    $scope.addDatasetSelector();

}]);

TallySheets.factory("DataSetsUID", ['$resource', function ($resource) {
    return $resource(ApiUrl + "/dataSets.json?fields=id,displayName&paging=false&translate=true",
        {},
        {get: {method: "GET"}});
}]);

TallySheets.factory("DataSetEntryForm", ['$resource', function ($resource) {
    return $resource(dhisUrl + "/dhis-web-dataentry/loadForm.action",
        {dataSetId: '@dataSetId'},
        {
            get: {
                method: "GET", transformResponse: function (response) {
                    return {codeHtml: response};
                }
            }
        });

    TallySheets.factory("OptionsFactory", ['$http', function ($http) {

        var OptionSetFactory = {};
        var successPromise = function (data) {
            OptionSetFactory.options = data;
            return OptionSetFactory.options;
        }
        var failurePromise = function (err) {
            OptionSetFactory.options = [];
            return OptionSetFactory.options;
        }

        OptionSetFactory.get = function () {
            if (OptionSetFactory.options)
                return Promise.resolve(OptionSetFactory.options);
            else
                $http.get(ApiUrl + "/options.json?fields=id,displayName&paging=false")
                    .then(successPromise, failurePromise)
        }

    }]);

}]);

TallySheets.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

TallySheets.directive('d2Progressbar', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/progressBar/progressBar.html'
    };
});

TallySheets.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/',
        suffix: '.json'
    });

    $translateProvider.registerAvailableLanguageKeys(
        ['es', 'fr', 'en', 'pt'],
        {
            'en*': 'en',
            'es*': 'es',
            'fr*': 'fr',
            'pt*': 'pt',
            '*': 'en' // must be last!
        }
    );

    $translateProvider.fallbackLanguage(['en']);

    jQuery.ajax({
        url: ApiUrl + '/userSettings/keyUiLocale/',
        contentType: 'text/plain',
        method: 'GET',
        dataType: 'text',
        async: false
    }).success(function (uiLocale) {
        if (uiLocale == '') {
            $translateProvider.determinePreferredLanguage();
        }
        else {
            $translateProvider.use(uiLocale);
        }
    }).fail(function () {
        $translateProvider.determinePreferredLanguage();
    });

});
