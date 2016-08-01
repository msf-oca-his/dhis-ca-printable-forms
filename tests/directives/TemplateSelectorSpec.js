describe("templateSelector ctrl", function () {
    var $controller;
    var queryDeferred;
    var scope;
    var dataSetService = {};
    var programService = {};
    var customAttributeService = {};
    var datasetCntrl;
    var httpMock;
    var window;
    var _$rootScope;
    var config;
    var d2;
    var $timeout, compile;
    var dataSet, program;
    var datasets, programs;
    var customAttribute;
    var customAttributes;
    var elements;
    beforeEach(function () {
        module("TallySheets");
        angular.module('d2HeaderBar', []);
        config = {
            Prefixes: {
                dataSetPrefix: "test_DS",
                programPrefix: "test_PROG_"
            },
            Attributes: {}
        };
        module(function ($provide) {
            $provide.value('Config', config);
            $provide.value('d2', d2);
            $provide.value('DataSetService', dataSetService);
            $provide.value('ProgramService', programService);
            $provide.value('CustomAttributeService', customAttributeService);
        });
    });

    beforeEach(inject(function (_$controller_, $q, $rootScope, $httpBackend, $window, _$timeout_, $compile, DataSet, Program, CustomAttribute) {
        _$rootScope = $rootScope;
        $timeout = _$timeout_;
        $controller = _$controller_;
        queryDeferred = $q.defer();
        scope = _$rootScope.$new();
        httpMock = $httpBackend;
        window = $window;
        compile = $compile;
        httpMock.expectGET("i18n/en.json").respond(200, {});
        dataSet = DataSet;
        program = Program;
        customAttribute = CustomAttribute;
        datasets = [
            new dataSet({
                id: 1,
                displayName: "dataset",
                attributeValues: [{
                    value: "true",
                    attribute: {
                        id: "1",
                        name: "isPrintable"
                    }
                }]
            }),
            new dataSet({
                id: 2,
                displayName: "dataset2",
                attributeValues: [{
                    value: "true",
                    attribute: {
                        id: "1",
                        name: "isPrintable"
                    }
                }]
            })
        ];
        programs = [
            new program({
                id: "1",
                displayName: "program1",
                attributeValues: [{
                    value: "true",
                    attribute: {
                        id: "1",
                        name: "isPrintable"
                    }
                }]
            }),
            new program({
                id: 2,
                displayName: "program2",
                attributeValues: [{
                    value: "true",
                    attribute: {
                        id: "1",
                        name: "isPrintable"
                    }
                }]
            })
        ];
        customAttributes = [
            new customAttribute({
                name: "isPrintable",
                id: "1",
                displayName: "isPrintable",
                dataSetAttribute: true,
                programAttribute: true
            }),
            new customAttribute({
                name: "isReporting",
                id: "2",
                displayName: "isReporting",
                dataSetAttribute: true,
                programAttribute: true
            })
        ]
    }));

    describe("template controller", function () {
        beforeEach(function () {
            dataSetService.getAllDataSets = function () {
                return Promise.resolve(datasets);
            };
            programService.getAllPrograms = function () {
                return Promise.resolve(programs);
            };
            customAttributeService.getAllCustomAttributes = function () {
                return Promise.resolve(customAttributes)
            };
            scope.testRenderDataSets = jasmine.createSpy('testSpy');
            scope.testTemplate = {};

            elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
            elements = compile(elements)(scope);
            scope.$digest();
        });

        it("should load all the datasets and programs when custom attribute is not specified in config", function (done) {
            Promise.resolve({})
                .then(function () {
                    Promise.resolve()
                        .then(function () {
                            expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
                            done();
                        });
                    _$rootScope.$digest();
                });
            _$rootScope.$digest();
        });

        it("should load all dataSets and programs when they have custom attribute along with value", function (done) {
            config.Attributes.printableUID = "1";
            elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
            elements = compile(elements)(scope);
            scope.$digest();
            Promise.resolve({})
                .then(function () {
                    Promise.resolve()
                        .then(function () {
                            expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
                            done();
                        });
                    _$rootScope.$digest();
                });
            _$rootScope.$digest();
        });

        it("should not load all dataSets and programs when they have custom attribute along with no value", function (done) {
            config.Attributes.printableUID = "1";
            datasets[0].attributeValues[0].value = "false";
            programs[0].attributeValues[0].value = "false";

            elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
            elements = compile(elements)(scope);
            datasets.splice(0, 1);
            programs.splice(0, 1);
            scope.$digest();
            Promise.resolve({})
                .then(function () {
                    Promise.resolve()
                        .then(function () {
                            expectedTemplates = scope.$$childHead.templates;
                            console.log(expectedTemplates, "scope.$$childHead.templates")
                            expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
                            done();
                        });
                    _$rootScope.$digest();
                });
            _$rootScope.$digest();
        });


        describe("On selecting a  template", function () {
            //TODO: pending testcases
            xit("should show the hour glass icon until templates are loaded", function () {
            })
            xit("should remove the hour glass icon after templates are loaded", function () {
            })

            xit("should update template", function (done) {
                var selectElement = elements[0].querySelector('select')
                Promise.resolve({})
                    .then(function () {
                        Promise.resolve({})
                            .then(function () {
                                selectElement.selectedIndex = 3;
                                selectElement.dispatchEvent(new Event('change'));
                                _$rootScope.$digest();
                                expect(scope.testTemplate).toEqual({id: programs[0].id, type: "PROGRAM"})
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