describe("DataSetProcessor",function(){
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

    beforeEach(inject(function (PrintFriendlyProcessor, $httpBackend, $q, _$rootScope_, $timeout,Config) {
        dataSetProcessor = PrintFriendlyProcessor;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        config = Config
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    describe("process dataset",function(){
        it("should process the basic dataset without sections to check page width and height", function(){
            var testDataSet = {
                id:"123",
                isPrintFriendlyProcessed:true,
                isResolved:Promise.resolve({}),
                name:"test dataset",
                sections:[],
                type:"dataset"
            };

            var expectedPages = [{
                heightLeft: config.DataSet.availableHeight,
                width:config.DataSet.availableWidth,
                contents:[],
                datasetName:"test dataset"
            }];

            var actualPages = dataSetProcessor.process(testDataSet);
            expect(actualPages).toEqual(expectedPages);
        });

        it("should process the dataset with sections of type catcomb without category optionCombos", function(){
            var testDataSet = {
                id:"123",
                isPrintFriendlyProcessed:true,
                isResolved:Promise.resolve({}),
                name:"test dataset",
                sections:[{
                    dataElements:[{
                        categoryCombo:{
                            id:"154",
                            categoryOptionCombos:[],
                            isResolved:Promise.resolve({}),
                            name:"catcomb"
                        },
                        id:"1234",
                        isResolved:Promise.resolve({}),
                        name:"dataElement",
                        type:"TEXT"
                    }],
                    id:"134",
                    isCatComb:true,
                    isResolved:Promise.resolve({}),
                    name:"section"
                }],
                type:"dataset"
            };
            //section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
            var expectedPages = [
                {
                    heightLeft: 188,
                    width:183,
                    contents:[
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section:testDataSet.sections[0]}],
                    datasetName:"test dataset"
                }
            ]
            var actualPages = dataSetProcessor.process(testDataSet);
            expect(actualPages).toEqual(expectedPages);

        });

        it("should process the dataset with sections of type catcomb with category option combos", function(){
            var testDataSet = {
                id:"123",
                isPrintFriendlyProcessed:true,
                isResolved:Promise.resolve({}),
                name:"test dataset",
                sections:[{
                    dataElements:[{
                        categoryCombo:{
                            categories:[{
                                id:"123",
                                name:"Gender"
                            }],
                            categoryOptionCombos:["male,5","female,7"],
                            id:"154",
                            isResolved:Promise.resolve({}),
                            name:"catcomb"
                        },
                        id:"1234",
                        isResolved:Promise.resolve({}),
                        name:"dataElement",
                        type:"TEXT"
                    }],
                    id:"134",
                    isCatComb:true,
                    isResolved:Promise.resolve({}),
                    name:"section"
                }],
                type:"dataset"
            };

            var expectedSection = {
                dataElements:[{
                    categoryCombo:{
                        categories:[{
                            id:"123",
                            name:"Gender"
                        }],
                        categoryOptionCombos:["male<br>5","female<br>7"],
                        id:"154",
                        isResolved:Promise.resolve({}),
                        name:"catcomb"
                    },
                    id:"1234",
                    isResolved:Promise.resolve({}),
                    name:"dataElement",
                    type:"TEXT"
                }],
                id:"134",
                isCatComb:true,
                isResolved:Promise.resolve({}),
                name:"section"
            };

            var expectedPages = [
                {
                    heightLeft: 188,
                    width:183,
                    contents:[
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section:expectedSection}],
                    datasetName:"test dataset"
                }
            ];

            var actualPages = dataSetProcessor.process(testDataSet);
            expect(actualPages).toEqual(expectedPages);
        });

        it("should process the dataset with sections of type catcomb with catgory option combos are overflowed", function(){
            var testDataSet = {
                id:"123",
                isPrintFriendlyProcessed:true,
                isResolved:Promise.resolve({}),
                name:"test dataset",
                sections:[{
                    dataElements:[{
                        categoryCombo:{
                            categories:[{
                                id:"123",
                                name:"Gender"
                            }],
                            categoryOptionCombos:["male,<5","female,<7","male,<10","female,<11","female,<12","male,<10"],
                            id:"154",
                            isResolved:Promise.resolve({}),
                            name:"catcomb"
                        },
                        id:"1234",
                        isResolved:Promise.resolve({}),
                        name:"dataElement",
                        type:"TEXT"
                    }],
                    id:"134",
                    isCatComb:true,
                    isResolved:Promise.resolve({}),
                    name:"section"
                }],
                type:"dataset"
            };
            //section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
            // and category option combos overflowed such that it splits into two sections one section has 49 other would be 32 because
            //duplicate sections won't contain dataset title so 237-49-32=156

            var expectedSection1 = {
                dataElements:[{
                    categoryCombo:{
                        categories:[{
                            id:"123",
                            name:"Gender"
                        }],
                        categoryOptionCombos:["male<br><5","female<br><7","male<br><10","female<br><11"],
                        id:"154",
                        isResolved:Promise.resolve({}),
                        name:"catcomb"
                    },
                    id:"1234",
                    isResolved:Promise.resolve({}),
                    name:"dataElement",
                    type:"TEXT"
                }],
                id:"134",
                isCatComb:true,
                isResolved:Promise.resolve({}),
                name:"section"
            };

            var expectedSection2 = {
                name:"section",
                id:"134",
                dataElements:[{
                    name:"dataElement",
                    id:"1234",
                    type:"TEXT",
                    categoryCombo:{
                        categories:[{
                            id:"123",
                            name:"Gender"
                        }],
                        categoryOptionCombos:["female<br><12","male<br><10"],
                        id:"154",
                        isResolved:Promise.resolve({}),
                        name:"catcomb"
                    },
                }],
                isCatComb:true,
                isDuplicate:true
                };

            var expectedPages = [
                {
                    heightLeft: 156,
                    width:183,
                    contents:[
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section',section:expectedSection1},
                        {type: 'section',section:expectedSection2}],
                    datasetName:"test dataset"
                }
            ];
            var actualPages = dataSetProcessor.process(testDataSet);
           expect(actualPages).toEqual(expectedPages);

        });



   })
});