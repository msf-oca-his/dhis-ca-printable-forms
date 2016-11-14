describe("templateSelector Directive", function() {
	var $controller;
	var queryDeferred, $q, $provide;
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
				dataSetPrefix: {
				translationKey:"dataset_prefix"
				},
				programPrefix:{
					translationKey:"program_prefix"
				}
			},
			CustomAttributes: {}
		};

		mockedModalAlertsService = {
			showModalAlert: function() {}
		};

		module("TallySheets", function(_$provide_, $translateProvider) {
			$translateProvider.translations('en', {});
			$provide = _$provide_;
		});

	});

	beforeEach(inject(function(_$controller_, _$q_, $rootScope, $httpBackend, $window, _$timeout_, $compile, DataSet, Program, CustomAttribute, ModalAlert, ModalAlertTypes) {
		_$rootScope = $rootScope;
		$timeout = _$timeout_;
		$controller = _$controller_;
		queryDeferred = _$q_.defer();
		scope = _$rootScope.$new();
		httpMock = $httpBackend;
		window = $window;
		compile = $compile;
		httpMock.expectGET("i18n/en.js").respond(200, {});
		dataSet = DataSet;
		program = Program;
		$q = _$q_;
		customAttribute = CustomAttribute;
		_ModalAlert = ModalAlert;
		_ModalAlertTypes = ModalAlertTypes;
		$provide.value('Config', config);
		$provide.value('d2', d2);
		$provide.value('DataSetService', dataSetService);
		$provide.value('ProgramService', programService);
		$provide.value('CustomAttributeService', customAttributeService);
		$provide.value('ModalAlertsService', mockedModalAlertsService);
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
				return $q.when(datasets);
			};
			programService.getAllPrograms = function() {
				return $q.when(programs);
			};
			customAttributeService.getAllCustomAttributes = function() {
				return $q.when(customAttributes)
			};
			customAttributeService.getCustomAttribute = function() {
				return $q.when(customAttributes[0])
			};

			scope.testRenderDataSets = jasmine.createSpy('testSpy');
			scope.testTemplate = {};
			scope.validationProcess = $q.when({showAllTemplates: true})
		});

		describe("loading templates", function() {
			it("should load all the templates when custom attribute is not present in the config", function() {
				scope.validationResult = $q.when({});
				config.CustomAttributes = {};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
			});

			it("should load only printable templates", function(done) {
				scope.validationResult = $q.when({});
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
				scope.validationResult = $q.when({});
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
				scope.validationResult = $q.when({});
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
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("attribute_not_set", _ModalAlertTypes.indismissibleError));
						done();
					});
				scope.$digest();
			})
		});

		describe("when template is dataset", function() {
			it("should prefix templates with appropriate prefix", function() {
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				expect(scope.$$childHead.dataSetTemplates[0].displayName.includes("dataset_prefix")).toEqual(true)
				expect(scope.$$childHead.programTemplates[0].displayName.includes("program_prefix")).toEqual(true)
			})
		});
		
		describe("Add form button", function() {
			it("should disable the add form button when nothing selected", function(){
				scope.change = jasmine.createSpy("change");
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.showAllTemplates = false;
				scope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(true);
			});
			it("should disable the add form button when program is selected", function() {
				scope.change = jasmine.createSpy("change");
				scope.showAllTemplates = false;
				scope.testTemplate = "PROGRAM";
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(true);
			});
			
			it("should enable the add form button when a dataset is selected", function() {
				scope.change = jasmine.createSpy("change");
				scope.showAllTemplates = false;
				scope.testTemplate = "DATASET";
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(false);
			});

			it("should able to add form when a dataset is selected", function() {
				scope.change = jasmine.createSpy("change");
				scope.showMultipleTemplates = true;
				scope.testTemplate = "DATASET";
				// scope.selectedTemplates = [{id:"123"}];
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				var selectElement = elements[0].querySelector('select');
				selectElement.selectedIndex = 1;
				selectElement.dispatchEvent(new Event('change'));
				scope.$apply();
				var button = elements[0].getElementsByTagName('button');
				button[0].click();
				expect(scope.$$childHead.selectedTemplates.length).toBe(2);
			});
			
			it("should able to remove the form from multiple datasets selected", function() {
				scope.change = jasmine.createSpy("change");
				scope.showMultipleTemplates = true;
				scope.testTemplate = "DATASET";
				// scope.selectedTemplates = [{id:"123"}];
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				var selectElement = elements[0].querySelector('select');
				selectElement.selectedIndex = 1;
				selectElement.dispatchEvent(new Event('change'));
				scope.$apply();
				var button = elements[0].getElementsByTagName('button');
				button[0].click();
				scope.$apply();
				var remove = elements[0].getElementsByClassName('glyphicon glyphicon-remove');
				remove[1].click();
				expect(scope.$$childHead.selectedTemplates.length).toBe(1);
				expect(scope.$$childHead.showMultipleTemplates).toBe(false);
			});

		});

		describe("On selecting a template", function() {
			it("should call onChange with selected templates", function(done) {
				scope.selectedTemplatesType = 'testType';
				scope.change = jasmine.createSpy("changespy");
				elements = angular.element('<template-selector on-change= "change(selectedTemplates)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(scope);
				scope.$apply();
				var selectElement = elements[0].querySelector('select')
				selectElement.selectedIndex = 3;
				selectElement.dispatchEvent(new Event('change'));
				scope.$apply();
				setTimeout(function(){
					scope.$apply();
					expect(scope.change).toHaveBeenCalledWith([programs[0]]);
					done();
				}, 1);
			});

		})

	})
});