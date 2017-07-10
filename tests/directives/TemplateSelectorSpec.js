describe("templateSelector Directive", function() {
	var $controller;
	var queryDeferred, $q, $provide;
	var scope;
	var dataSetService = {};
	var programService = {};
	var customAttributeService = {};
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
	var childScope;
	var mockedTemplateProcessor;

	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		config = {
			Prefixes: {
				dataSetPrefix: {
					translationKey: "dataset_prefix"
				},
				programPrefix: {
					translationKey: "program_prefix"
				}
			},
			customAttributes: {}
		};

		mockedModalAlertsService = {
			showModalAlert: function() {}
		};
		
		module("TallySheets", function(_$provide_, $translateProvider) {
			$translateProvider.translations('en', {});
			$provide = _$provide_;
		});

	});

	beforeEach(inject(function(_$controller_, _$q_, $rootScope, _$timeout_, $compile, DataSet, Program, CustomAttribute, ModalAlert, ModalAlertTypes) {
		_$rootScope = $rootScope;
		$timeout = _$timeout_;
		$controller = _$controller_;
		queryDeferred = _$q_.defer();
		scope = _$rootScope.$new();
		scope.PageTypes = {
			COVERSHEET: "COVERSHEET",
			REGISTER: "REGISTER",
			CODESHEET: "CODESHEET",
			DATASET: "DATASET",
			PROGRAM: "PROGRAM"
		};
		childScope = scope.$new();
		compile = $compile;
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
		mockedTemplateProcessor = {
			getTemplates: function() {
				return [datasets,programs];
			}
		};
		$provide.value('TemplateProcessor', mockedTemplateProcessor);
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

			childScope.testRenderDataSets = jasmine.createSpy('testSpy');
			childScope.testTemplate = {};
			childScope.validationProcess = $q.when({showAllTemplates: true})
		});

		describe("loading templates", function() {
			it("should load all the templates when custom attribute is not present in the config", function() {
				childScope.validationResult = $q.when({});
				config.customAttributes = {};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				expect(childScope.$$childHead.templates).toEqual(datasets.concat(programs));
			});

			it("should load only printable templates", function(done) {
				childScope.validationResult = $q.when({});
				config.customAttributes.printFlagUID = {id: '1'};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$digest();
				getPromiseOfDepth(3)
					.then(function() {
						expect(childScope.$$childHead.templates).toEqual(datasets.concat(programs));
						done();
					});
				childScope.$digest();
			});

			it("should not load templates which has printable attribute value as false", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				datasets[0].attributeValues[0].value = "false";
				programs[0].attributeValues[0].value = "false";
				childScope.validationResult = $q.when({});
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$digest();
				expectedDataSets = _.clone(datasets);
				expectedPrograms = _.clone(programs);
				expectedDataSets.splice(0, 1);
				expectedPrograms.splice(0, 1);
				getPromiseOfDepth(3)
					.then(function() {
						expect(childScope.$$childHead.templates).toEqual(expectedDataSets.concat(expectedPrograms));
						done();
					});
				childScope.$digest();
			});

			it("should show an alert when printable attribute is not set in any template ", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				childScope.validationResult = $q.when({});
				datasets[0].attributeValues[0].value = "false";
				datasets[1].attributeValues[0].value = "false";
				programs[0].attributeValues[0].value = "false";
				programs[1].attributeValues[0].value = "false";
				spyOn(mockedModalAlertsService, 'showModalAlert');
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$digest();
				getPromiseOfDepth(3)
					.then(function() {
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("attribute_not_set", _ModalAlertTypes.indismissibleError));
						done();
					});
				childScope.$digest();
			});

			it("should show an alert when there are no templates in the system", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				childScope.validationResult = $q.when({});
				datasets = [];
				programs = [];
				spyOn(mockedModalAlertsService, 'showModalAlert');
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$digest();
				var buttonText = "go_to_home";
				getPromiseOfDepth(3)
					.then(function() {
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("no_templates", _ModalAlertTypes.indismissibleError,buttonText));
						done();
					});
				childScope.$digest();
			})
		});

		describe("when template is dataset", function() {
			it("should prefix templates with appropriate prefix", function() {
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				expect(childScope.$$childHead.dataSetTemplates[0].displayName.includes("dataset_prefix")).toEqual(true)
				expect(childScope.$$childHead.programTemplates[0].displayName.includes("program_prefix")).toEqual(true)
			})
		});

		describe("Add form button", function() {
			it("should disable the add form button when nothing selected", function() {
				childScope.change = jasmine.createSpy("change");
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.showAllTemplates = false;
				childScope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(true);
			});
			it("should disable the add form button when program is selected", function() {
				childScope.change = jasmine.createSpy("change");
				childScope.showAllTemplates = false;
				childScope.testTemplate = "PROGRAM";
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(true);
			});

			it("should enable the add form button when a dataset is selected", function() {
				childScope.change = jasmine.createSpy("change");
				childScope.showAllTemplates = false;
				childScope.testTemplate = "DATASET";
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				var button = elements[0].getElementsByTagName('button');
				expect(button[0].classList.contains('ng-hide')).toBe(false);
			});

			it("should able to add form when a dataset is selected", function() {
				childScope.change = jasmine.createSpy("change");
				childScope.showMultipleTemplates = true;
				childScope.testTemplate = "DATASET";
				// childScope.selectedTemplates = [{id:"123"}];
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				var selectElement = elements[0].querySelector('select');
				selectElement.selectedIndex = 1;
				selectElement.dispatchEvent(new Event('change'));
				childScope.$apply();
				var button = elements[0].getElementsByTagName('button');
				button[0].click();
				expect(childScope.$$childHead.selectedTemplates.length).toBe(2);
			});

			it("should able to remove the form from multiple datasets selected", function() {
				childScope.change = jasmine.createSpy("change");
				childScope.showMultipleTemplates = true;
				childScope.testTemplate = "DATASET";
				// childScope.selectedTemplates = [{id:"123"}];
				elements = angular.element('<template-selector on-change= "change()" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				var selectElement = elements[0].querySelector('select');
				selectElement.selectedIndex = 1;
				selectElement.dispatchEvent(new Event('change'));
				childScope.$apply();
				var button = elements[0].getElementsByTagName('button');
				button[0].click();
				childScope.$apply();
				var remove = elements[0].getElementsByClassName('glyphicon glyphicon-remove');
				remove[1].click();
				expect(childScope.$$childHead.selectedTemplates.length).toBe(1);
				expect(childScope.$$childHead.showMultipleTemplates).toBe(false);
			});

		});

		describe("On selecting a template", function() {
			it("should call onChange with selected templates", function(done) {
				childScope.selectedTemplatesType = 'testType';
				childScope.change = jasmine.createSpy("changespy");
				elements = angular.element('<template-selector on-change= "change(selectedTemplates)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				var selectElement = elements[0].querySelector('select')
				selectElement.selectedIndex = 3;
				selectElement.dispatchEvent(new Event('change'));
				childScope.$apply();
				setTimeout(function() {
					childScope.$apply();
					expect(childScope.change).toHaveBeenCalledWith([programs[0]]);
					done();
				}, 1);
			});
		});
	});
});