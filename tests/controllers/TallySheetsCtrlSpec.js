describe("TallySheets ctrl", function () {
    var $controller;
    var scope;
    var defer;
    var _$rootScope;
    var dataSetService;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve({}));
        });
    });


    beforeEach(inject(function (_$controller_,$rootScope,$q,DataSetService) {
        _$rootScope = $rootScope;
        defer = $q.defer();
        dataSetService = DataSetService;
        scope = _$rootScope.$new();
        $controller = _$controller_;
    }));

    beforeEach(function() {
        window1= {location: { replace: jasmine.createSpy()} }
        $controller('TallySheetsController', {$scope: scope});
    });

    describe("go home", function(){
        //it("should redirect to dhisurl", function(){
        //   scope.goHome();
        //});
    });

    describe("render datasets", function(){
        it("should not dataset if it doen't have form id", function(){
            expect(scope.renderDataSets()).toEqual(Promise.resolve({}));
        });
        //it("should render the datastets if it has form id", function(done){
        //    scope.form.id = 123;
        //    scope.form.type ="dataset";
        //    var mockDataset={
        //        id: "12",
        //        name: "general",
        //        sections: [{id: "1", name: "section1"}, {id: "2", name: "section2"}]
        //    };
        //    spyOn(dataSetService,"getDataSet").and.callFake(function(id){
        //        defer.resolve(mockDataset);
        //        return defer.promise;
        //
        //    });
        //    expect(scope.renderDataSets()).toEqual("ksfsl")
        //    done();
        //})
    })
});