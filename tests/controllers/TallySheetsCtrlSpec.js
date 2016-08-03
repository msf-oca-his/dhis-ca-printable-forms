describe("TallySheets ctrl", function () {
    var $controller;
    var scope;
    var defer;
    var _$rootScope;
    var dataSetService;
    var mockedDataSetService;
    var httpMock;
    var mockedDataSetProcessor;
    var mockedProgramService;
    var mockedProgramProcessor;
    var expectedPages;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);

        var mockDataset="testDataSet"
        var mockProgram="testProgram"

        expectedPages = "testPages"

        mockedDataSetService = {
            getReferentialDataSet: function () {
                return Promise.resolve(mockDataset);
            }
        };
        mockedProgramService = {
            getProgram: function() {
                return Promise.resolve(mockProgram);
            }
        };
        mockedDataSetProcessor = {
            process: function() {
                return expectedPages;
            }
        };

        mockedProgramProcessor = {
           process: function() {
                return expectedPages;
            }
        };

        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve({}));
            $provide.value('DataSetService',mockedDataSetService);
            $provide.value('PrintFriendlyProcessor', mockedDataSetProcessor);
            $provide.value('ProgramService', mockedProgramService);
            $provide.value('ProgramProcessor',mockedProgramProcessor);

        });
    });


    beforeEach(inject(function (_$controller_,$rootScope,$q,DataSetService,$httpBackend) {
        _$rootScope = $rootScope;
        defer = $q.defer();
        dataSetService = DataSetService;
        scope = _$rootScope.$new();
        $controller = _$controller_;
        httpMock = $httpBackend;
        httpMock.expectGET("i18n/en.json").respond(200, {});
    }));

    beforeEach(function() {
        $controller('TallySheetsController', {$scope: scope});
    });

    describe("render datasets", function(){
        it("should not render dataset if it doesn't have template id", function(){
            scope.template.id = undefined;
            expect(scope.renderDataSets()).toEqual(Promise.resolve({}));
        });

        it("should render the dataSets if it has template id", function(done){
            scope.template.id = 123;
            scope.template.type ="DATASET";
            _$rootScope.$apply();
            scope.renderDataSets().then(function(){
                expect(scope.spinnerShown).toEqual(false);
                expect(scope.pages).toEqual(expectedPages);
                done();
            });
            scope.$digest();
        });

        it("should render the programs if it has template id", function(done){
            scope.template.id = 123;
            scope.template.type ="PROGRAM";
            scope.programMode = "COVERSHEET";
            _$rootScope.$apply();
            scope.renderDataSets().then(function(){
                expect(scope.spinnerShown).toEqual(false);
                expect(scope.pages).toEqual(expectedPages);
                done();
            });

            scope.$digest();
        });

        it("should not render the template which is neither program nor dataset if it has template id", function(){
            scope.template.id = 123;
            scope.template.type =""
            scope.renderDataSets();
            expect(scope.spinnerShown).toEqual(false);
            expect(scope.pages).toEqual([]);
        });
    })
});