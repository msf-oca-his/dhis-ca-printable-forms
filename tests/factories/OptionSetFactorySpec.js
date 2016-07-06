describe("Optionset Factory", function () {
    var httpMock;
    var optionSetFactory;
    var rootScope;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
    });

    beforeEach(inject(function($httpBackend,OptionSetFactory,$rootScope) {
        rootScope = $rootScope;
        httpMock = $httpBackend;
        optionSetFactory = OptionSetFactory;
        httpMock.expectGET("i18n/en.json").respond(200, {});
    }));

    describe('fecthing of optionsets', function(){
        it("successful fecthing of optionsets", function(done){
            httpMock.expectGET("http://localhost:8000/api/optionSets.json?paging=false").respond(200, {
                id: 123,
                optionSets: [{id: 123, name:"optionset1"}]
            });
            httpMock.expectGET("http://localhost:8000/api/optionSets/123.json?paging=false").respond(200, {id: 123, name:"optionset1"});

            var expectedOptionSets = {
                123: {id:123,name:"optionset1"}
            };
            optionSetFactory.then(function(optionsets){
                expect(optionsets).toEqual(expectedOptionSets);
                done();
            })
            setInterval(rootScope.$digest,900);
            httpMock.flush();
        });

        it("error fecthing of optionsets", function(done){
            httpMock.expectGET("http://localhost:8000/api/optionSets.json?paging=false").respond(400, {
                id: 123,
                optionSets: [{id: 123}]
            });
            optionSetFactory.then(function(optionsets){
                expect(optionsets).toEqual({});
                done();
            });
            setInterval(rootScope.$digest,900);
            httpMock.flush();
        });

    })
});