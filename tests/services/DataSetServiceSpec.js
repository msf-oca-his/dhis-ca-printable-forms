describe("DataSetService", function () {
    var dataSetService;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;
    var mockd2;
    var mockedDataSets;
    var getToArray = function(arguments){
        return function(){
            return arguments;
        }
    };
    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("TallySheets");
        //optionsObject = {
        //    123: {id: "123", name: "male", options: {name: "option1"}},
        //    12: {id: "12", name: "female", options: {name: "option2"}}
        //};
        //var mockedSection = {
        //    id: "1234",
        //    name: "section3"
        //}
        mockd2 = Promise.resolve({
            models: {
                dataSets: {
                    list: function() {
                        return Promise.resolve(mockedDataSets)
                    }
                }
            }
        });

        module(function ($provide) {
            $provide.value('d2', mockd2);
        });
    });

    beforeEach(inject(function (DataSetService, $httpBackend, $q, _$rootScope_, $timeout, d2) {
        dataSetService = DataSetService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        //httpMock.expectGET("i18n/en.json").respond(200, {});
    }));

    describe("getDataset", function () {
        it("should get the basic data set object", function (done) {
            //var dataSet = {
            //    id: "1234"
            //};
            //var serverDataSet = {
            //    id: "12",
            //    name: "general",
            //    sections: [{id: "1", name: "section1"}, {id: "2", name: "section2"}]
            //};
            var expectedDataSet = {
                id: "12",
                name: "general",
                type: 'dataset',
                sections: [{
                    id: "1234",
                    name: "section3"
                }, {
                    id: "1234",
                    name: "section3"
                }],
                isPrintFriendlyProcessed: false
            };
            var section1DataElements = [{
                id: "1234",
                name: "section3"
            }, {
              id: "1234",
              name: "section3"
              }
            ];

            var mockedSections = [{toArray: getToArray(section1DataElements)}];
            var mockedDataSets = [{sections:{toArray: getToArray(mockedSections)} }];
            var d2DataSetCollection = {toArray: getToArray(mockedDataSets), size: 1 };
            dataSetService.getDataSet(expectedDataSet.id).then(function (dataSet) {
                    console.log(expectedDataSet, dataSet)
                    expect(expectedDataSet).toEqual(dataSet)
                    done();
                });
            //setInterval($rootScope.digest, 900)
        });

        //it("should get the failure response when dataset object not found", function(){
        //    var dataSet = {
        //        id:"1234"
        //    };
        //    spyOn(window,'alert');
        //    httpMock.expectGET("http://localhost:8000/api/dataSets/" + dataSet.id + ".json").respond(404);
        //    dataSetService.getDataSet(dataSet.id).then(function (dataSet) {
        //        expect(window.alert).toHaveBeenCalledWith("Fetching dataset failed.....")
        //    });
        //
        //    httpMock.flush();
        //});
        //
        //it("should fetch the datasets from the cached dataset array", function(){
        //    var dataSet = {
        //        id:"1234"
        //    };
        //});

    });
});