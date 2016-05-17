describe("ProgramStageSectionService", function () {
    var programStageSectionService;
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
            isResolved: Promise.resolve({})
        };
        var mockedDataElementService = {
            getDataElement: function (dataElement) {
                return Promise.resolve(mockedDataElement);
            }
        };

        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve(optionsObject));
            $provide.value('DataElementService', mockedDataElementService);
        });
    });

    beforeEach(inject(function (ProgramStageSectionService, $httpBackend, $q, _$rootScope_, $timeout) {
        programStageSectionService = ProgramStageSectionService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    describe("getStageSection", function () {
        var stagedataElement = {
            dataElement: {
                id: "123",
                name: "dataelement1"
            }
        };
        var section = {
            id: "123"
        }
        var serverSection = {
            id: "123",
            name: "section1",
            programStageDataElements: [{
                id: "1234",
                name: "dataElement3"
            }, {
                id: "1235",
                name: "dataElement4"
            }]
        };
        var expectedSection = {
            id: "123",
            name: "section1",
            dataElements: [{
                id: "1234",
                name: "dataElement1",
                isResolved: Promise.resolve({})

            }, {
                id: "1234",
                name: "dataElement1",
                isResolved: Promise.resolve({})
            }],
            isResolved: Promise.resolve({})

        };
        it("should get the stage section object from the server", function (done) {
            //spyOn(programStageSectionService, "getDataElement").and.returnValue(dataElement);
            httpMock.expectGET("http://localhost:8000/api/programStageSections/" + section.id + ".json").respond(200, serverSection);
            httpMock.expectGET("http://localhost:8000/api/programStageDataElements/" + serverSection.programStageDataElements[0].id + ".json").respond(200, stagedataElement);
            httpMock.expectGET("http://localhost:8000/api/programStageDataElements/" + serverSection.programStageDataElements[1].id + ".json").respond(200, stagedataElement);
            programStageSectionService.getStageSection(section.id).then(function (section) {
                section.isResolved.then(function () {
                    expect(section).toEqual(expectedSection)
                    done();
                })
            });
            httpMock.flush();
            setInterval($rootScope.$digest, 900);

        });

        it("should get the failure response when program section object not found", function(){
            var section = {
                id: "123"
            };
            var failurePromise = {isError: true, status:404, statusText:''};
            httpMock.expectGET("http://localhost:8000/api/programStageSections/" + section.id + ".json").respond(404);
            programStageSectionService.getStageSection(section.id).then(function(response){
                expect(failurePromise).toEqual(response);
            });

            httpMock.flush();
        });

    })
});