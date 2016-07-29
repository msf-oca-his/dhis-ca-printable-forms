describe("templateSelector Directive", function() {
  var $controller;
  var queryDeferred;
  var scope;
  var dataSetService = {};
  var programService = {};
  var datasetCntrl;
  var httpMock;
  var _$rootScope;
  var config;
  var d2;
  var $timeout, compile;
  var dataSet, program;
  var datasets, programs;
  var elements;
  beforeEach(function() {
    module("TallySheets");
    angular.module('d2HeaderBar', []);
    config = {
      Prefixes: {
        dataSetPrefix: "test_DS",
        programPrefix: "test_PROG_"
      }
    };
    module(function($provide) {
      $provide.value('Config', config);
      $provide.value('d2', d2);
      $provide.value('DataSetService', dataSetService);
      $provide.value('ProgramService', programService);
    });
  });

  beforeEach(inject(function(_$controller_, $q, $rootScope, $httpBackend, _$timeout_, $compile, DataSet, Program) {
    _$rootScope = $rootScope;
    $timeout = _$timeout_;
    $controller = _$controller_;
    queryDeferred = $q.defer();
    scope = _$rootScope.$new();
    httpMock = $httpBackend;
    compile = $compile;
    httpMock.expectGET("i18n/en.json").respond(200, {});
    dataSet = DataSet
    program = Program
    datasets = [ new dataSet({ id: 1, displayName: "dataset" }), new dataSet({ id: 2, displayName: "dataset2" }) ];
    programs = [ new program({ id: 1, displayName: "program1" }), new program({ id: 2, displayName: "program2" }) ];

  }));

  describe("template controller", function() {
    beforeEach(function() {
      dataSetService.getAllDataSets = function() {
        return Promise.resolve(datasets);
      }
      programService.getAllPrograms = function() {
        return Promise.resolve(programs);
      };
      scope.testRenderDataSets = jasmine.createSpy('testSpy')
      scope.testTemplate = {};

      elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
      elements = compile(elements)(scope);
      scope.$digest();
    });

    it("should load all the datasets and programs", function(done) {
      Promise.resolve({})
        .then(function() {
          Promise.resolve()
            .then(function() {
              expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
              done();
            });
          _$rootScope.$digest();
        });
      _$rootScope.$digest();

    });

    describe("On selecting a  template", function() {
      //TODO: pending testcases
      xit("should show the hour glass icon until templates are loaded",function(){})
      xit("should remove the hour glass icon after templates are loaded",function(){})

      it("should update template", function(done) {
        var selectElement = elements[ 0 ].querySelector('select')
        Promise.resolve({})
          .then(function() {
            Promise.resolve({})
              .then(function() {
                selectElement.selectedIndex = 3;
                selectElement.dispatchEvent(new Event('change'));
                _$rootScope.$digest();
                expect(scope.testTemplate).toEqual({id:programs[0].id, type: "PROGRAM"})
                expect(scope.testRenderDataSets).toHaveBeenCalled();
                done();
              });
            _$rootScope.$digest();
          });
        _$rootScope.$digest();

      });

    })


  })
});