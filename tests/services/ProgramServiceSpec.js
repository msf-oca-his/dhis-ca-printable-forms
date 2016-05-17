describe("ProgramService", function () {
    var programService;
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
        var mockedSection = {
            id: "1234",
            name: "section3",
            isResolved:Promise.resolve({})
        }
        var mockedProgramStageSectionService = {
            getStageSection: function (id) {
                return Promise.resolve(mockedSection);
            }
        }

        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve(optionsObject));
            $provide.value('ProgramStageSectionService', mockedProgramStageSectionService);
        });
    });

    beforeEach(inject(function (ProgramService, $httpBackend, $q, _$rootScope_, $timeout) {
        programService = ProgramService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    describe("getProgram", function () {
        it("should get the basic program object", function (done) {
            var program = {
                id: "1234"
            };
            var serverProgram = {
                id: "12",
                name: "general",
                programStageSections: [{id: "1", name: "stage1"}, {id: "2", name: "stage2"}]
            };
            var expectedProgram = {
                id: "12",
                name: "general",
                type: 'program',
                stageSections: [{
                    id: "1234",
                    name: "section3",
                    isResolved: Promise.resolve({})
                }, {
                    id: "1234",
                    name: "section3",
                    isResolved: Promise.resolve({})

                }],
                isPrintFriendlyProcessed: false,
                isResolved: Promise.resolve({})
            };
            httpMock.expectGET("http://localhost:8000/api/programStages/" + program.id + ".json").respond(200, serverProgram);
            programService.getProgram(program.id).then(function (program) {
                program.isResolved.then(function () {
                    expect(expectedProgram).toEqual(program);
                    done();
                })
            });
            httpMock.flush();
            setInterval($rootScope.digest, 900)
        });

        it("should get the failure response when program object not found", function(){
            var program = {
                id:"1234"
            };
            spyOn(window,'alert');
            httpMock.expectGET("http://localhost:8000/api/programStages/" + program.id + ".json").respond(404);
            programService.getProgram(program.id).then(function (program) {
                expect(window.alert).toHaveBeenCalledWith("Fetching program failed.....")
            });

            httpMock.flush();
        });

        //it("should fetch the datasets from the cached dataset array", function(){
        //    var dataSet = {
        //        id:"1234"
        //    };
        //});

    });
});