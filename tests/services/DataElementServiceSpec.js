describe("DataElementService", function () {
    var dataElementService;
    var mockDataElementService = {};
    var httpMock;
    var $rootScope;
    var timeout;
    var p;
    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("TallySheets");
        var mockedOptionSet = function () {
            return Promise.resolve({});
        };

        module(function ($provide) {
            $provide.value('OptionSetFactory', mockedOptionSet);
        });
    });


    beforeEach(inject(function (DataElementService, $httpBackend, $q, _$rootScope_, $timeout) {
        dataElementService = DataElementService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        httpMock.expectGET("languages/en.json").respond(200, {});

    }));

    describe("getDataElementFromData", function () {
        it("Should get basic data element object", function () {
            var responseData = {
                id: 123,
                name: "Karma",
                categoryCombo: "",
                type: "DataSet",
                OptionSet: "OptionSets",
                Options: true
            };
            var expectedData = {
                name: "Karma",
                id: 123,
                type: "DataSet",
                categoryCombo: ""

            };
            var actualData = dataElementService.getDataElementFromData(responseData);
            expect(actualData).toEqual(expectedData);
        })
    });

    describe("getDataElement", function () {

        it("should not get category combs and categories of dataElements when category combo is default", function () {
            var dataElement = {
                id: "1234"
            };
            var serverDataElement = {
                id: "1234",
                name: "Karma",
                categoryCombo: {
                    name: "default"
                }
            };
            var expectedDataElement = {
                id: "1234",
                name: "Karma",
                type: "TEXT"
            };

            var expectedOutput;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            dataElementService.getDataElement(dataElement).then(function (response) {
                expectedOutput = response;
            });
            httpMock.flush();
            expectedDataElement.isResolved = expectedOutput.isResolved;
            expect(expectedOutput).toEqual(expectedDataElement)
        });

        it("should get dataElement with catcombs when category combo is not default", function (done) {
            var dataElement = {
                id: "1234"
            };

            var serverDataElement = {
                id: "1234",
                name: "Karma",
                type: "TEXT",
                categories: {},
                categoryCombo: {
                    id: "1234",
                    name: "newCatcomb"
                }
            };
            var serverCatCombs = {id: 'combo1', name: "ss", categories: [{id: 'cat1'}]};
            var serverCategories = {categoryOptions: [{id: 'coc1', name: 'coc1'}, {id: 'coc2', name: 'coc2'}]};


            var actualDataElement;
            var categories;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            httpMock.expectGET("http://localhost:8000/api/categoryCombos/" + serverDataElement.id + ".json").respond(200, serverCatCombs);
            httpMock.expectGET("http://localhost:8000/api/categories/cat1.json").respond(200, serverCategories);
            dataElementService.getDataElement(dataElement).then(function (response) {
               actualDataElement = response;
                actualDataElement.isResolved.then(function () {
                    console.log(actualDataElement.categoryCombo.categories);

                    actualCategories = actualDataElement.categoryCombo.categories;
                    expectedCategories = serverCatCombs.categories;

                    actualCatCombs = actualDataElement.categoryCombo;
                    //to remove the isResolved promise
                    delete actualCatCombs.isResolved;
                    expectedCatCombs = {id: 'combo1', name: "ss", categories: [{id: 'cat1'}],categoryOptionCombos:['coc1','coc2']}

                    expect(expectedCategories).toEqual(actualCategories);
                    expect(expectedCatCombs).toEqual(actualCatCombs)

                    done();
                })

            });
            httpMock.flush();
            setInterval($rootScope.$digest, 900);
        });

        it("should get the cartesian product of categoryOptions in sortedOrder",function(done) {
            var dataElement = {
                id: "1234"
            };

            var serverDataElement = {
                id: "1234",
                name: "Karma",
                type: "TEXT",
                categories: {},
                categoryCombo: {
                    id: "1234",
                    name: "newCatcomb"
                }
            };
            var serverCatCombs = {id: 'combo1', name: "ss", categories: [{id: 'cat1'},{id:'cat2'}]};
            var serverCategories1 = {categoryOptions: [{id: 'coc1', name: 'coc1'}, {id: 'coc2', name: 'coc2'},{id: 'coc3', name: 'coc3'}]};
            var serverCategories2 = {categoryOptions: [{id: 'coc4', name: 'coc4'}, {id: 'coc5', name: 'coc5'},{id: 'coc6', name: 'coc6'}]};


            var actualDataElement;
            var categories;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            httpMock.expectGET("http://localhost:8000/api/categoryCombos/" + serverDataElement.id + ".json").respond(200, serverCatCombs);
            httpMock.expectGET("http://localhost:8000/api/categories/cat1.json").respond(200, serverCategories2);
            httpMock.expectGET("http://localhost:8000/api/categories/cat2.json").respond(200, serverCategories1);
            dataElementService.getDataElement(dataElement).then(function (response) {
                actualDataElement = response;
                actualDataElement.isResolved.then(function () {

                    actualCatCombs = actualDataElement.categoryCombo;
                    expectedSortedCategoryOptionCombos = ['coc4,coc1', 'coc4,coc2', 'coc4,coc3', 'coc5,coc1', 'coc5,coc2', 'coc5,coc3', 'coc6,coc1', 'coc6,coc2', 'coc6,coc3'];
                    expectedUnsortedCategoryOptionCombos = ['coc4,coc2', 'coc4,coc1', 'coc4,coc3', 'coc5,coc1', 'coc5,coc2', 'coc5,coc3', 'coc6,coc1', 'coc6,coc2', 'coc6,coc3']

                    expect(actualCatCombs.categoryOptionCombos).toEqual(expectedSortedCategoryOptionCombos);
                    expect(actualCatCombs.categoryOptionCombos).not.toEqual(expectedUnsortedCategoryOptionCombos);
                    done();
                })

            });
            httpMock.flush();
            setInterval($rootScope.$digest, 900);
        });

        it("should dataElement display form name", function(){
            var dataElement = {
                id: "1234"
            };
            var serverDataElement = {
                id: "1234",
                name: "Karma",
                displayFormName:"displayKarma",
                categoryCombo: {
                    name: "default"
                }
            };
            var expectedDataElement = {
                id: "1234",
                name: "displayKarma",
                type: "TEXT"
            };

            var expectedOutput;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            dataElementService.getDataElement(dataElement).then(function (response) {
                expectedOutput = response;
            });
            httpMock.flush();
            expectedDataElement.isResolved = expectedOutput.isResolved;
            expect(expectedOutput).toEqual(expectedDataElement)
        });

        it("should get the failure promise when server not responded", function(){
            var dataElement = {
                id: "1234"
            };
            var failurePromise = {isError: true, status:404, statusText:''};
            var expectedOutput;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(404);
            dataElementService.getDataElement(dataElement).then(function (response) {
                expectedPromise = response;
            });
            httpMock.flush();
            expect(expectedPromise).toEqual(failurePromise)
        })

    });

});