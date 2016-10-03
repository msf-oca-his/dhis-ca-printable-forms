describe("templateSelector Directive", function() {
	var $controller;
	var queryDeferred;
	var scope;
	var dataSetService = {};
	var programService = {};
	var customAttributeService = {};
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
	var _ModalAlert;
	var _ModalAlertTypes;
	var mockedModalAlertsService;

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		config = {
			Prefixes: {
				dataSetPrefix: "test_DS",
				programPrefix: "test_PROG_"
			},
			CustomAttributes: {}
		};

		mockedModalAlertsService = {
			showModalAlert: function() {}
		};

		module("TallySheets", function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('d2', d2);
			$provide.value('DataSetService', dataSetService);
			$provide.value('ProgramService', programService);
			$provide.value('CustomAttributeService', customAttributeService);
			$provide.value('ModalAlertsService', mockedModalAlertsService);
			$translateProvider.translations('en', {
				"ATTRIBUTE_NOT_SET": "The specified UID is not set in any template. Please contact your system administrator."
			});
		});
	});

	beforeEach(inject(function(_$controller_, $q, $rootScope, $httpBackend, $window, _$timeout_, $compile, DataSet, Program, CustomAttribute, ModalAlert, ModalAlertTypes) {
		_$rootScope = $rootScope;
		$timeout = _$timeout_;
		$controller = _$controller_;
		queryDeferred = $q.defer();
		scope = _$rootScope.$new();
		httpMock = $httpBackend;
		window = $window;
		compile = $compile;
		httpMock.expectGET("i18n/en.js").respond(200, {});
		dataSet = DataSet;
		program = Program;
		customAttribute = CustomAttribute;
		_ModalAlert = ModalAlert;
		_ModalAlertTypes = ModalAlertTypes;
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
		];
		validationObject = {}
	}));

	describe("template controller", function() {
		beforeEach(function() {
			dataSetService.getAllDataSets = function() {
				return Promise.resolve(datasets);
			};
			programService.getAllPrograms = function() {
				return Promise.resolve(programs);
			};
			customAttributeService.getAllCustomAttributes = function() {
				return Promise.resolve(customAttributes)
			};
			customAttributeService.getCustomAttribute = function() {
				return Promise.resolve(customAttributes[0])
			};

			scope.testRenderDataSets = jasmine.createSpy('testSpy');
			scope.testTemplate = {};
			scope.validationProcess = Promise.resolve({showAllTemplates: true})
		});

		describe("loading templates", function() {
			it("should load all the templates when custom attribute is not present in the config", function(done) {
				scope.validationResult = Promise.resolve({});
				config.CustomAttributes = {};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				getPromiseOfDepth(3).then(function() {
					expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
					done();
				});
				scope.$digest();
			});

			it("should load only printable templates", function(done) {
				scope.validationResult = Promise.resolve({});
				config.CustomAttributes.printFlagUID = {id: '1'};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				getPromiseOfDepth(3)
					.then(function() {
						expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
						done();
					});
				scope.$digest();
			});

			it("should not load templates which has printable attribute value as false", function(done) {
				config.CustomAttributes.printFlagUID = {id: "1"};
				datasets[0].attributeValues[0].value = "false";
				programs[0].attributeValues[0].value = "false";
				scope.validationResult = Promise.resolve({});
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				expectedDataSets = _.clone(datasets);
				expectedPrograms = _.clone(programs);
				expectedDataSets.splice(0, 1);
				expectedPrograms.splice(0, 1);
				getPromiseOfDepth(3)
					.then(function() {
						expect(scope.$$childHead.templates).toEqual(expectedDataSets.concat(expectedPrograms));
						done();
					});
				scope.$digest();
			});

			it("should show an alert when printable attribute is not set in any template ", function(done) {
				config.CustomAttributes.printFlagUID = {id: "1"};
				scope.validationResult = Promise.resolve({});
				datasets[0].attributeValues[0].value = "false";
				datasets[1].attributeValues[0].value = "false";
				programs[0].attributeValues[0].value = "false";
				programs[1].attributeValues[0].value = "false";
				spyOn(mockedModalAlertsService, 'showModalAlert');
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				getPromiseOfDepth(3)
					.then(function() {
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("The specified UID is not set in any template. Please contact your system administrator.", _ModalAlertTypes.indismissibleError));
						done();
					});
				scope.$digest();
			})
		});

		describe("On selecting a template", function() {
			//TODO: pending testCases
			xit("should show the hour glass icon until templates are loaded", function() {})
			xit("should remove the hour glass icon after templates are loaded", function() {})

			it("should call onSelectTemplate with selected templates", function(done) {
				elements = angular.element('<template-selector on-select-template= "testRenderDataSets(selectedTemplate)" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				var selectElement = elements[0].querySelector('select')
				getPromiseOfDepth(3)
					.then(function() {
						selectElement.selectedIndex = 3;
						selectElement.dispatchEvent(new Event('change'));
						_$rootScope.$digest();
						expect(scope.testRenderDataSets).toHaveBeenCalledWith(programs[0]);
						done();
					})
			});

		})

	})
});