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
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);

        var mockDataset={
            id: "12",
            name: "general",
            sections: [{id: "1", name: "section1"}, {id: "2", name: "section2"}],
            isResolved:Promise.resolve({})
        };

        var mockProgram={
            id: "12",
            name: "general",
            stageSections: [{id: "1", name: "section1"}, {id: "2", name: "section2"}],
            isResolved:Promise.resolve({})
        };

        var expectedPages = [
            {
                heightLeft: 188,
                width: 183,
                contents: [
                    {type: 'dataSetName', name: "test dataset"},
                    {type: 'section', section: {}}],
                datasetName: "test dataset"
            }
        ];

        mockedDataSetService = {
            getDataSet: function () {
                defer.resolve(mockDataset);
                return defer.promise;

            }
        };
        mockedProgramService = {
            getProgram: function() {
                defer.resolve(mockProgram);
                return defer.promise;
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
        it("should not render dataset if it doesn't have form id", function(){
            scope.form.id = undefined;
            expect(scope.renderDataSets()).toEqual(Promise.resolve({}));
        });

        it("should render the dataSets if it has form id", function(done){
            scope.form.id = 123;
            scope.form.type ="dataset";
            var expectedPages = [
                {
                    heightLeft: 188,
                    width: 183,
                    contents: [
                        {type: 'dataSetName', name: "test dataset"},
                        {type: 'section', section: {}}],
                    datasetName: "test dataset"
                }
            ]

            scope.renderDataSets().then(function(){
                expect(scope.spinnerShown).toEqual(false);
                expect(scope.pages).toEqual(expectedPages);
                done();
            });
            setInterval(_$rootScope.$digest, 900);
        });

        it("should render the programs if it has form id", function(){
            scope.form.id = 123;
            scope.form.type ="program";
            scope.programMode = true;
            var expectedPages = [
                {
                    heightLeft: 188,
                    width: 183,
                    contents: [
                        {type: 'dataSetName', name: "test program"},
                        {type: 'section', section: {}}],
                    datasetName: "test program"
                }
            ];

            scope.renderDataSets().then(function(){
                expect(scope.spinnerShown).toEqual(false);
                expect(scope.pages).toEqual(expectedPages);
                done();
            });
            setInterval(_$rootScope.$digest, 900);
        });

        it("should render the template which is neither program nor dataset if it has form id", function(){
            scope.form.id = 123;
            scope.form.type =""
            scope.renderDataSets();
            expect(scope.spinnerShown).toEqual(false);
        });
    })
});