describe("printable template service spec", function() {
	var $q;
	var scope;
	var dataSetService = {};
	var programService = {};
	var customAttributeService = {};
	var _$rootScope;
	var config;
	var d2;
	var dataSet, program;
	var customAttribute;
	var customAttributes;
	var _ModalAlert;
	var _ModalAlertTypes;
	var mockedModalAlertsService;
	var mockedUserService = {};
	var printableTemplateService;
	var dataSets;
	var programs;
	var template;
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

		module("TallySheets", function($translateProvider) {
			$translateProvider.translations('en', {});
		});

		module(function($provide) {
			$provide.value('Config', config);
			$provide.value('d2', d2);
			$provide.value('DataSetService', dataSetService);
			$provide.value('ProgramService', programService);
			$provide.value('CustomAttributeService', customAttributeService);
			$provide.value('ModalAlertsService', mockedModalAlertsService);
			$provide.value('UserService', mockedUserService);
		});

	});

	beforeEach(inject(function(_$q_, $rootScope, DataSet, Program, CustomAttribute, ModalAlert, ModalAlertTypes, PrintableTemplateService, Template) {
		_$rootScope = $rootScope;
		scope = _$rootScope.$new();
		scope.PageTypes = {
			COVERSHEET: "COVERSHEET",
			REGISTER: "REGISTER",
			CODESHEET: "CODESHEET",
			DATASET: "DATASET",
			PROGRAM: "PROGRAM"
		};

		dataSet = DataSet;
		program = Program;
		template = Template;
		$q = _$q_;
		printableTemplateService = PrintableTemplateService;
		customAttribute = CustomAttribute;
		_ModalAlert = ModalAlert;
		_ModalAlertTypes = ModalAlertTypes;

		dataSets =
			[{
				displayName: "ds1",
				attributeValues: [{
					value: "true",
					attribute: {
						id: "1",
						name: "isPrintable"
					}
				}]
			},
				{
					displayName: "ds2",
					attributeValues: [{
						value: "false",
						attribute: {
							id: "1",
							name: "isPrintable"
						}
					}]
				}];
		programs = [{
			displayName: "prog1",
			attributeValues: [{
				value: "true",
				attribute: {
					id: "1",
					name: "isPrintable"
				}
			}]
		}, {
			displayName: "prog2",
			attributeValues: [{
				value: "false",
				attribute: {
					id: "1",
					name: "isPrintable"
				}
			}]
		}];

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
				return $q.when(dataSets);
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
			mockedUserService.getDataSetsAndPrograms = function() {
				return $q.when([[dataSets[1]], [programs[1]]]);
			}
		});

		describe("get templates", function() {
			it("should get templates when custom attribute is not present in the config", function(done) {
				config.customAttributes = {};
				config.showUserRelatedFormsOnly = false;
				var expectedTemplates = [
					new template("DataSet", dataSets[0], "dataset_prefixds1"),
					new template("DataSet", dataSets[1], "dataset_prefixds2"),
					new template("Program", programs[0], "program_prefixprog1"),
					new template("Program", programs[1], "program_prefixprog2"),
				];
				printableTemplateService.getTemplates().then(function(templates) {

					expect(templates).toEqual(expectedTemplates);
					done();
				});
				scope.$apply();
			});

			it("should load only printable templates", function(done) {
				config.customAttributes.printFlagUID = {id: '1'};
				config.showUserRelatedFormsOnly = false;
				var expectedTemplates = [
					new template("DataSet", dataSets[0], "dataset_prefixds1"),
					new template("Program", programs[0], "program_prefixprog1"),
				];
				printableTemplateService.getTemplates().then(function(templates) {
					expect(templates).toEqual(expectedTemplates);
					done();
				});
				scope.$apply();
			});

			it("should not load templates which has printable attribute value as false", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				dataSets[0].attributeValues[0].value = "false";
				var expectedTemplates = [
					new template("Program", programs[0], "program_prefixprog1")
				];
				printableTemplateService.getTemplates().then(function(templates) {
					expect(templates).toEqual(expectedTemplates);
					done();
				});
				scope.$apply();

			});

			it("should show an alert when printable attribute is not set in any template ", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				dataSets[0].attributeValues[0].value = "false";
				programs[0].attributeValues[0].value = "false";
				spyOn(mockedModalAlertsService, 'showModalAlert')
				printableTemplateService.getTemplates();
				getPromiseOfDepth(1)
					.then(function() {
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("attribute_not_set", _ModalAlertTypes.indismissibleError));
						done();
					});
				scope.$apply();
			});

			it("should show an alert when there are no templates in the system", function(done) {
				config.customAttributes.printFlagUID = {id: "1"};
				dataSets = [];
				programs = [];
				spyOn(mockedModalAlertsService, 'showModalAlert');
				var buttonText = "go_to_home";
				printableTemplateService.getTemplates()
				getPromiseOfDepth(3)
					.then(function() {
						expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("no_templates", _ModalAlertTypes.indismissibleError, buttonText));
						done();
					});
				scope.$apply();
			})
		});

		it("should prefix templates with appropriate prefix", function(done) {
			config.customAttributes.printFlagUID = {id: "1"};
			programs[0].attributeValues[0].value = "false";
			printableTemplateService.getTemplates().then(function(templates) {
				expect(templates[0].displayName).toContain(config.Prefixes.dataSetPrefix.translationKey);
				done();
			});
			scope.$apply();
		});

		it("should give the templtes based on users orgunit", function(done) {
			config.showUserRelatedFormsOnly = true;
			var actualTemplates = [
				new template("DataSet", dataSets[1], "dataset_prefixds2"),
				new template("Program", programs[1], "program_prefixprog2")
			];
			printableTemplateService.getTemplates().then(function(templates) {
				expect(templates).toEqual(actualTemplates);
				done();
			});
			scope.$apply();
		})
	});
});