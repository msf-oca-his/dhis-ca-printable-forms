describe("templateSelector ctrl", function () {
    var $controller;
    var queryDeferred;
    var scope;
    var dataSetsUID;
    var programsUID;
    var datasetCntrl;
    var httpMock;
    var _$rootScope;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        module(function ($provide) {
            $provide.value('OptionSetFactory', Promise.resolve({}));
        });
    });


    beforeEach(inject(function (_$controller_,$q,$rootScope,DataSetsUID,ProgramsUID,$httpBackend) {
        _$rootScope = $rootScope;
        $controller = _$controller_;
        queryDeferred = $q.defer();
        scope = _$rootScope.$new();
        dataSetsUID = DataSetsUID;
        programsUID = ProgramsUID;
        httpMock = $httpBackend;
        httpMock.expectGET("i18n/en.json").respond(200, {});
    }));

    describe("template controller", function() {
        var datasets =[{id:1,name:"dataset"},{id:2,name:"dataset2"}];
        var programs = [{id:1,name:"program1"},{id:2,name:"program2"}]
        beforeEach(function(){
            spyOn(dataSetsUID,'get').and.callFake(function(callback){
                queryDeferred.promise.then(callback);
                return {$promise: queryDeferred.promise};
            });
            spyOn(programsUID,'get').and.callFake(function(callback){
                queryDeferred.promise.then(callback);
                return {$promise: queryDeferred.promise}
            });
            datasetCntrl = $controller('templateSelectorCtrl',{$scope:scope});
        });
        it("should test displaying of datasets in the dropdown", function(){
            var currentDatasets = _.cloneDeep(datasets);
            var expectedDataSetList =[{id:1,name:"dataset",type:"dataset"},{id:2,name:"dataset2",type:"dataset"}];

            queryDeferred.resolve({dataSets:currentDatasets});
            scope.$apply();
            _$rootScope.$broadcast('ngRepeatFinished');

            expect(scope.dataSetList).toEqual(expectedDataSetList);
        });

        it("should test displaying of program in the dropdown", function(){
            var currentPrograms = _.cloneDeep(programs);
            var expectedDataSetList = [{id:1,name:"dataset",type:"dataset"},{id:2,name:"dataset2",type:"dataset"},{id:1,name:"program1",type:"program"},{id:2,name:"program2",type:"program"}]

            queryDeferred.resolve({dataSets:datasets,programStages:currentPrograms});
            scope.$apply();
            _$rootScope.$broadcast('ngRepeatFinished');
            expect(scope.dataSetList).toEqual(expectedDataSetList);
        });

        it("should test if dsId triggres the select function or not", function(){
            scope.selectorId = "123";

            spyOn(document,"getElementById").and.callFake(function(){
                return {};
            });
            $('#t1').trigger('change');
        });


    })
});