describe("Optionset Factory", function () {
    var httpMock;
    var optionSetFactory;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
    });

    beforeEach(inject(function($httpBackend,OptionSetFactory) {
        httpMock = $httpBackend;
        optionSetFactory = OptionSetFactory;
        httpMock.expectGET("languages/en.json").respond(200, {});
    }));

    describe('fecthing of optionsets', function(){
        it("successful fecthing of optionsets", function(){
            httpMock.expectGET("http://localhost:8000/api/optionSets.json?paging=false").respond(200, {
                id: 123,
                optionSets: [{id: 123}]
            });
            httpMock.expectGET("http://localhost:8000/api/optionSets/123.json?paging=false").respond(200, {})
            httpMock.flush();
        });

        it("error fecthing of optionsets", function(){
            httpMock.expectGET("http://localhost:8000/api/optionSets.json?paging=false").respond(400, {
                id: 123,
                optionSets: [{id: 123}]
            });
            httpMock.flush();
        });

    })
});