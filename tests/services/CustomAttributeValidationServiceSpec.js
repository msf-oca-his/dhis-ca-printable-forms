describe("CustomAttributeValidationService", function() {
	var customAttributeService = {};
	var httpMock;
	var window;
	var _$rootScope;
	var config;
	var customAttribute;
	var mockedCustomAttribute;
	var customAttributeValidationService;
	var _ModalAlert;
	var _ModalAlertTypes;
	var mockedModalAlertsService;

	beforeEach(function() {
		config = {
			Prefixes: {
				dataSetPrefix: "test_DS",
				programPrefix: "test_PROG_"
			},
			CustomAttributes: {
				displayOptionUID: {
					id: "1",
					associatedWith: ['dataElement'],
					options: {
						none: '0',
						text: '1',
						list: '2'
					}
				},
				printFlagUID: {
					id: "2",
					associatedWith: ['dataSet', 'program']
				}
			}
		};

		mockedModalAlertsService = {
			showModalAlert: function() {}
		};

		angular.module('d2HeaderBar', []);
		module("TallySheets", function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('CustomAttributeService', customAttributeService);
			$provide.value('ModalAlertsService', mockedModalAlertsService);
			$translateProvider.preferredLanguage('en');
			$translateProvider.translations('en', {
				"no_attribute_exists": "The specified UID doesn't exist in the system. Please contact your system administrator.",
				"no_association_with_optionset": "The specified attribute is not associated with any optionSet. Please contact your system administrator.",
				"optionset_without_options": "The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.",
				"optionset_with_incorrect_options": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.",
				"no_association_with_entity": "No association between the attribute and the specified entity in config"
			});
		});
	});

	beforeEach(inject(function($rootScope, $httpBackend, $window, CustomAttribute, CustomAttributeValidationService, ModalAlert, ModalAlertTypes) {
		_$rootScope = $rootScope;
		httpMock = $httpBackend;
		window = $window;
		httpMock.expectGET("i18n/en.js").respond(200, {});
		customAttribute = CustomAttribute;
		customAttributeValidationService = CustomAttributeValidationService;
		_ModalAlert = ModalAlert;
		_ModalAlertTypes = ModalAlertTypes;

		mockedCustomAttribute = new customAttribute({
			name: "displayOptions",
			id: "1",
			displayName: "displayOptions",
			dataElementAttribute: true,
			options: [{code: '0'}, {code: '1'}, {code: '2'}]
		});
	}));

	beforeEach(function() {
		customAttributeService.getCustomAttribute = function() {
			return Promise.resolve(mockedCustomAttribute)
		};
	});

	describe("validation of all custom attributes", function() {
		it("should be undefined when no custom attributes in config", function() {
			config.CustomAttributes = undefined;
			expect(customAttributeValidationService.validate()).toEqual(undefined);
			_$rootScope.$digest();
		});

		it("should show an alert when specified display custom attribute is not present in dhis", function(done) {
			mockedCustomAttribute = {};
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : The specified UID doesn't exist in the system. Please contact your system administrator.");
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should show an alert when there is no association between custom attribute and any entity", function(done) {
			mockedCustomAttribute.optionSet = undefined;
			mockedCustomAttribute.dataElementAttribute = false;
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : No association between the attribute and the specified entity in config");
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should show an alert when the custom attribute is not associated with optionSet", function(done) {
			mockedCustomAttribute.optionSet = undefined;
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : The specified attribute is not associated with any optionSet. Please contact your system administrator.");
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should show an alert when the optionSet of attribute doesn't have options", function(done) {
			mockedCustomAttribute.optionSet = {id: '12'};
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.");
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should show an alert when the optionSet options of a custom attribute are incorrect", function(done) {
			mockedCustomAttribute.optionSet = {id: '1', options: [{code: '8'}, {code: '9'}, {code: '10'}]};
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.");
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should be validated as true when custom attribute in dhis is same as in app config", function(done) {
			delete config.CustomAttributes.printFlagUID;
			mockedCustomAttribute.optionSet = {id: '1', options: [{code: '0'}, {code: '1'}, {code: '2'}]};
			customAttributeValidationService.validate().then(function(result) {
				expect(result).toEqual([true]);
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		});

		it("should not validate optionSet of custom attribute when it doesn't have options in config", function() {
			delete config.CustomAttributes.displayOptionUID;
			mockedCustomAttribute = new customAttribute({
				name: "isPrintable",
				id: "2",
				displayName: "isPrintable",
				dataSetAttribute: true,
				programAttribute: true
			});
			customAttributeValidationService.validate().then(function(result) {
				expect(result).toEqual([true]);
				done();
			});
			getAngularPromiseOfDepth(8, _$rootScope);
		})
	});
});