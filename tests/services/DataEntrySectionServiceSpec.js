describe("DataEntrySectionService", function () {
    var dataEntrySectionService;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("TallySheets");
        optionsObject = {
            123: {id: "123", name: "male", options: {name: "option1"}},
            12: {id: "12", name: "female", options: {name: "option2"}}
        };
        var mockedDataElement = {
            id: "1234",
            name: "dataElement1",
            isResolved:Promise.resolve({})
        }
        var mockedDataElementService = {
            getDataElement: function (dataElement) {
                return Promise.resolve(mockedDataElement);
            }
        }

        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve(optionsObject));
            $provide.value('DataElementService', mockedDataElementService);
        });
    });

    beforeEach(inject(function (DataEntrySectionService, $httpBackend, $q, _$rootScope_, $timeout) {
        dataEntrySectionService = DataEntrySectionService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        httpMock.expectGET("i18n/en.json").respond(200, {});
    }));

    describe("getSectionFromData", function () {
        it("Should get basic data section object", function () {
            var responseDataSection = {
                id: 123,
                name: "Karma",
                dataElements: {},
                isCatComb: false,
                isDuplicate: false
            };
            var expectedDataSection = {
                id: 123,
                name: "Karma",
                dataElements: {},
                isCatComb: false,
                isDuplicate: false
            };
            var actualDataSection = dataEntrySectionService.getSectionFromData(responseDataSection);
            expect(actualDataSection).toEqual(expectedDataSection);
        })
    });

    describe("getSection", function () {
        it("should get data section object from server", function (done) {
            var section = {
                id: "123"
            };
            var serverSection = {
                name: "section1",
                id: "123",
                dataElements: [{
                    id: "1234",
                    name: "dataElement3"
                }, {
                    id: "1235",
                    name: "dataElement4"
                }]
            };

            var expectedSection = {
                name:"section1",
                id:"123",
                dataElements:[{
                    id: "1234",
                    name: "dataElement1",
                    isResolved:Promise.resolve({})
                },{id: "1234",
                    name: "dataElement1",
                    isResolved:Promise.resolve({})}],
                isCatComb:false,
                isResolved:Promise.resolve({})
            };
            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(200, serverSection);
            dataEntrySectionService.getSection(section.id).then(function(section){
                section.isResolved.then(function(){
                    expect(section).toEqual(expectedSection);
                    done();
                })
            });
            httpMock.flush();
            setInterval($rootScope.digest,900);
        })

        it("should get the failure response when section object not found", function(){
            var section = {
                id: "123"
            };
            spyOn(window,'alert');
            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(404);
            dataEntrySectionService.getSection(section.id).then(function(section){
                expect(window.alert).toHaveBeenCalledWith("Could not connect to DHIS")
            });

            httpMock.flush();
        });
    });
});