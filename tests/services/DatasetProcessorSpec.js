describe("DataSetProcessor", function () {
    var dataSetProcessor;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;
    var config;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("TallySheets");
        optionsObject = {
            123: {id: "123", name: "male", options: {name: "option1"}},
            12: {id: "12", name: "female", options: {name: "option2"}}
        };
        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve(optionsObject));
        });
    });

    beforeEach(inject(function (PrintFriendlyProcessor, $httpBackend, $q, _$rootScope_, $timeout, Config) {
        dataSetProcessor = PrintFriendlyProcessor;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        config = Config;
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    describe("process dataset", function () {
        it("should process the basic dataset without sections to check page width and height", function () {
            var testDataSet = {
                id: "123",
                isPrintFriendlyProcessed: true,
                isResolved: Promise.resolve({}),
                name: "test dataset",
                sections: [],
                type: "dataset"
            };

            var expectedPages = [{
                heightLeft: config.DataSet.availableHeight,
                width: config.DataSet.availableWidth,
                contents: [],
                datasetName: "test dataset"
            }];

            var actualPages = dataSetProcessor.process(testDataSet);
            expect(actualPages).toEqual(expectedPages);
        });

        describe("sections with Only Catcombs", function () {
            var testDataSet = {
                id: "123",
                isPrintFriendlyProcessed: true,
                isResolved: Promise.resolve({}),
                name: "test dataset",
                sections: [{
                    dataElements: [{
                        categoryCombo: {
                            id: "154",
                            categoryOptionCombos: ["female<br><12", "male<br><10"],
                            isResolved: Promise.resolve({}),
                            name: "catcomb"
                        },
                        id: "1234",
                        isResolved: Promise.resolve({}),
                        name: "dataElement",
                        type: "TEXT"
                    }],
                    id: "134",
                    isCatComb: true,
                    isResolved: Promise.resolve({}),
                    name: "section"
                }],
                type: "dataset"
            };


            it("should process the dataset with sections of type catcomb without category optionCombos", function () {
                var dataSet = _.clone(testDataSet);
                //section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
                var expectedPages = [
                    {
                        heightLeft: 188,
                        width: 183,
                        contents: [
                            {type: 'dataSetName', name: "test dataset"},
                            {type: 'section', section: dataSet.sections[0]}],
                        datasetName: "test dataset"
                    }
                ];
                var actualPages = dataSetProcessor.process(dataSet);
                expect(actualPages).toEqual(expectedPages);
            });

            it("should process the dataset with sections of type catcomb with category option combos", function () {
                var currentTestDataSet = _.clone(testDataSet);

                currentTestDataSet.sections[0].dataElements[0].categoryCombo.categories = [{
                    id: "123",
                    name: "Gender"
                }];

                currentTestDataSet.sections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];

                var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

                expectedSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br>5", "female<br>7"];

                var expectedPages = [
                    {
                        heightLeft: 188,
                        width: 183,
                        contents: [
                            {type: 'dataSetName', name: "test dataset"},
                            {type: 'section', section: expectedSection}],
                        datasetName: "test dataset"
                    }
                ];
                var actualPages = dataSetProcessor.process(currentTestDataSet);
                expect(actualPages).toEqual(expectedPages);
            });

            it("should process the dataset with sections of type catcomb with catgory option combos are overflowed", function () {

                var currentTestDataSet = _.cloneDeep(testDataSet);

                currentTestDataSet.sections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];

                var expectedSection1 = _.cloneDeep(currentTestDataSet.sections[0]);

                expectedSection1.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br><5", "female<br><7", "male<br><10", "female<br><11"];

                var expectedDuplicateSection = {
                    name: "section",
                    id: "134",
                    dataElements: [{
                        name: "dataElement",
                        id: "1234",
                        type: "TEXT",
                        categoryCombo: {
                            id: "154",
                            categoryOptionCombos: ["female<br><12", "male<br><10"],
                            isResolved: Promise.resolve({}),
                            name: "catcomb",
                            categories: [{id: '123', name: 'Gender'}]
                        }
                    }],
                    isCatComb: true,
                    isDuplicate: true
                }

                var expectedPages = [
                    {
                        heightLeft: 156,
                        width: 183,
                        contents: [
                            {type: 'dataSetName', name: "test dataset"},
                            {type: 'section', section: expectedSection1},
                            {type: 'section', section: expectedDuplicateSection}],
                        datasetName: "test dataset"
                    }
                ];
                var actualPages = dataSetProcessor.process(currentTestDataSet);
                expect(actualPages[0].contents[2]).toEqual(expectedPages[0].contents[2]);

            });

            it("should process the dataset with overflowed section of type catcomb", function () {
                var currentTestDataSet = _.cloneDeep(testDataSet);

                var assignCOCToSection = function (section, numofDe) {
                    for (var index = 0; index < numofDe; index++) {
                        section.dataElements[index] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
                    }
                };

                assignCOCToSection(currentTestDataSet.sections[0], 20);

                var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
                assignCOCToSection(expectedSection1, 17); //because 17 elements will fit into the first page

                var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
                assignCOCToSection(expectedSection2, 3);
                expectedSection2.isDuplicate = false;
                var expectedPages = [{
                    heightLeft: 0,
                    width: 183,
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: expectedSection1}],
                    datasetName: "test dataset"
                },
                    {
                        heightLeft: 164,
                        width: 183,
                        contents: [
                            {type: 'section', section: expectedSection2}],
                        datasetName: "test dataset"
                    }];

                var actualPages = dataSetProcessor.process(currentTestDataSet);

                expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
                expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
            });
        });

        describe("sections of type Optionsets", function () {
            var testDataSet = {
                id: "123",
                isPrintFriendlyProcessed: true,
                isResolved: Promise.resolve({}),
                name: "test dataset",
                sections: [{
                    dataElements: [{
                        id: "1234",
                        isResolved: Promise.resolve({}),
                        name: "dataElement",
                        options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
                        type: "OPTIONSET"
                    }],
                    id: "134",
                    isResolved: Promise.resolve({}),
                    name: "section"
                }],
                type: 'dataset'
            };

            it("should process the section contain only one dataelement of type optionset", function () {
                var currentTestDataSet = _.cloneDeep(testDataSet);

                var expectedSection = _.cloneDeep(currentTestDataSet.sections[0]);

                var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

                expectedSection.dataElements[0].rows = expectedRows;
                expectedSection.isOptionSet = true;
                expectedSection.leftSideElements = [expectedSection.dataElements[0]];
                expectedSection.rightSideElements = [];


                var expectedPages = [{
                    heightLeft: 0,
                    width: 183,
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: expectedSection}],
                    datasetName: "test dataset"
                }];

                var actualPages = dataSetProcessor.process(currentTestDataSet);
                expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
            });

            it("should process the dataset which contians dataelement of type optionsets where options are overflowed", function () {
                var currentTestDataSet = _.cloneDeep(testDataSet);

                var assignOptionsToDe = function (section, numberOfOptions) {
                    for (var index = 0; index < numberOfOptions; index++) {
                        section.dataElements[0].options[index] = {id: 1, name: "option"};
                    }
                }
                assignOptionsToDe(currentTestDataSet.sections[0], 75);//75 options will overflow to the new page

                var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
                assignOptionsToDe(expectedSection1, 72);
                var expectedRows1 = [];
                for (var i = 0; i < 24; i++) {
                    var j = 0;
                    while (j < 3) {
                        if (j == 0)
                            expectedRows1.push([{id: 1, name: "option"}]);
                        else
                            expectedRows1[i].push({id: 1, name: "option"});
                        j++;
                    }
                }

                expectedSection1.dataElements[0].rows = expectedRows1;
                expectedSection1.isOptionSet = true;
                expectedSection1.leftSideElements = [expectedSection1.dataElements[0]];
                expectedSection1.rightSideElements = [];

                var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
                assignOptionsToDe(expectedSection2, 3);
                var expectedRows2 = [];
                for (var i = 0; i < 1; i++) {
                    var j = 0;
                    while (j < 3) {
                        if (j == 0)
                            expectedRows2.push([{id: 1, name: "option"}]);
                        else
                            expectedRows2[i].push({id: 1, name: "option"});
                        j++;
                    }
                }
                expectedSection2.dataElements[0].rows = expectedRows2;
                expectedSection2.isOptionSet = true;
                expectedSection2.leftSideElements = [expectedSection2.dataElements[0]];
                expectedSection2.rightSideElements = [];
                expectedSection2.isDuplicate = false;

                var expectedPages = [{
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: expectedSection1}],
                    datasetName: "test dataset"
                }, {
                    contents: [
                        {type: 'section', section: expectedSection2}],
                    datasetName: "test dataset"
                }];
                var acutalPages = dataSetProcessor.process(currentTestDataSet);
                expect(acutalPages[1].contents).toEqual(expectedPages[1].contents);
                expect(acutalPages[0].contents[1]).toEqual(expectedPages[0].contents[1]);
            });
            it("should process the dataset which contains dataelements of type option set and general dataelements", function () {
                var currentTestDatSet = _.cloneDeep(testDataSet);
                currentTestDatSet.sections[0].dataElements[1] = {
                    id: "1",
                    name: "general de"
                };

                var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
                var expectedRows1 = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
                expectedSection1.dataElements[0].rows = expectedRows1;
                expectedSection1.isDuplicate = false;
                expectedSection1.isOptionSet = true;
                expectedSection1.leftSideElements = [expectedSection1.dataElements[0]];
                expectedSection1.rightSideElements = [];

                var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
                expectedSection2.dataElements[0] = currentTestDatSet.sections[0].dataElements[1];
                expectedSection2.isDuplicate = true;
                expectedSection2.leftSideElements = [currentTestDatSet.sections[0].dataElements[1]];
                expectedSection2.rightSideElements = [];

                var expectedPages = [{
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: expectedSection1},
                        {type: 'section', section: expectedSection2}],
                    datasetName: "test dataset"
                }];

                var actualPages = dataSetProcessor.process(currentTestDatSet);
                expect(actualPages[0].contents[2]).toEqual(expectedPages[0].contents[2]);
            });

        });

        describe("data elements of type TEXT", function () {
            var testDataSet = {
                id: "123",
                isPrintFriendlyProcessed: true,
                isResolved: Promise.resolve({}),
                name: "test dataset",
                sections: [{
                    dataElements: [{
                        id: "1234",
                        isResolved: Promise.resolve({}),
                        name: "dataElement",
                        type: "TEXT"
                    }],
                    id: "134",
                    isCatComb: false,
                    isResolved: Promise.resolve({}),
                    name: "section"
                }],
                type: 'dataset'
            };

            it("when dataelements of type text in a section are overflowed", function () {
                var currentTestDataSet = _.cloneDeep(testDataSet);
                var assignDeToSections = function (section, numberOfDe) {
                    for (var i = 0; i < numberOfDe; i++) {
                        section.dataElements[i] = _.cloneDeep(testDataSet.sections[0].dataElements[0]);
                    }
                }
                assignDeToSections(currentTestDataSet.sections[0], 50);

                var expectedSection1 = _.cloneDeep(testDataSet.sections[0]);
                var expectedNumberOfElements = 48;
                assignDeToSections(expectedSection1, expectedNumberOfElements);
                expectedSection1.leftSideElements = [];
                expectedSection1.rightSideElements = [];
                for (var i = 0; i < expectedNumberOfElements; i++) {
                    if (i < (expectedNumberOfElements / 2))
                        expectedSection1.leftSideElements.push(currentTestDataSet.sections[0].dataElements[i]);
                    else
                        expectedSection1.rightSideElements.push(currentTestDataSet.sections[0].dataElements[i]);
                }
                ;

                var expectedSection2 = _.cloneDeep(testDataSet.sections[0]);
                assignDeToSections(expectedSection2, 2);//expected would be 2
                expectedSection2.leftSideElements = [{
                    id: "1234",
                    isResolved: Promise.resolve({}),
                    name: "dataElement",
                    type: "TEXT"
                }];
                expectedSection2.rightSideElements = [{
                    id: "1234",
                    isResolved: Promise.resolve({}),
                    name: "dataElement",
                    type: "TEXT"
                }];
                expectedSection2.isDuplicate = false;

                var expectedPages = [{
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: expectedSection1}],
                    datasetName: "test dataset"
                }, {
                    contents: [
                        {type: 'section', section: expectedSection2}
                    ]
                }];

                var actualPages = dataSetProcessor.process(currentTestDataSet);
                expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
                expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
            });
        });
    })
});
