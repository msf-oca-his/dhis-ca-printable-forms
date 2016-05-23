describe("TallySheets ctrl", function () {
    var $controller;
    var scope;
    var defer;
    var _$rootScope;
    var dataSetService;
    var mockedDataSetService;
    var httpMock;
    var mockedProcessor;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);

        var mockDataset={
            id: "12",
            name: "general",
            sections: [{id: "1", name: "section1"}, {id: "2", name: "section2"}],
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
        mockedProcessor = {
            process: function() {
                return expectedPages;
            }
        };


        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve({}));
            $provide.value('DataSetService',mockedDataSetService);
            $provide.value('PrintFriendlyProcessor', mockedProcessor)
        });
    });


    beforeEach(inject(function (_$controller_,$rootScope,$q,DataSetService,$httpBackend) {
        _$rootScope = $rootScope;
        defer = $q.defer();
        dataSetService = DataSetService;
        scope = _$rootScope.$new();
        $controller = _$controller_;
        httpMock = $httpBackend;
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    beforeEach(function() {
        $controller('TallySheetsController', {$scope: scope});
    });

    //describe("go home", function(){
    //    it("should redirect to dhisurl", function(){
    //       //scope.goHome();
    //
    //    });
    //});

    describe("render datasets", function(){
        it("should not render dataset if it doesn't have form id", function(){
            scope.form.id = undefined;
            expect(scope.renderDataSets()).toEqual(Promise.resolve({}));
        });

        it("should render the dataSets if it has form id", function(){
            scope.form.id = 123;
            scope.form.type ="dataset";

            scope.renderDataSets();
            //expect(scope.spinnerShown).toEqual("slkfj");
            //expect(scope).toEqual("skfjs")

            //_$rootScope.$apply();
        })
    })
});