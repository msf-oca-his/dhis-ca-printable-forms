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
        config = Config
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
            }

            it("should process the section contain only one dataelement of type optionset", function () {
                var currentTestDataSet = _.clone(testDataSet);

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

        })


    })
});
