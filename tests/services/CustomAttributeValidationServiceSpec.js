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
			$translateProvider.translations('en', {
				"NO_ATTRIBUTE_EXISTS": "The specified UID doesn't exist in the system. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_OPTIONSET": "The specified attribute is not associated with any optionSet. Please contact your system administrator.",
				"OPTIONSET_WITHOUT_OPTIONS": "The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.",
				"OPTIONSET_WITH_INCORRECT_OPTIONS": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_ENTITY": "No association between the attribute and the specified entity in config"
			});
		});
	});

	beforeEach(inject(function($rootScope, $httpBackend, $window, CustomAttribute, CustomAttributeValidationService, ModalAlert, ModalAlertTypes) {
		_$rootScope = $rootScope;
		httpMock = $httpBackend;
		window = $window;
		httpMock.expectGET("i18n/en.json").respond(200, {});
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
			// spyOn(window, 'alert');
			spyOn(mockedModalAlertsService, 'showModalAlert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("displayOptionUID : The specified UID doesn't exist in the system. Please contact your system administrator.", _ModalAlertTypes.indismissibleError));
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when there is no association between custom attribute and any entity", function(done) {
			mockedCustomAttribute.optionSet = undefined;
			mockedCustomAttribute.dataElementAttribute = false;
			spyOn(mockedModalAlertsService, 'showModalAlert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("displayOptionUID : No association between the attribute and the specified entity in config", _ModalAlertTypes.indismissibleError));
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the custom attribute is not associated with optionSet", function(done) {
			mockedCustomAttribute.optionSet = undefined;
			spyOn(mockedModalAlertsService, 'showModalAlert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("displayOptionUID : The specified attribute is not associated with any optionSet. Please contact your system administrator.", _ModalAlertTypes.dismissibleError));
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the optionSet of attribute doesn't have options", function(done) {
			mockedCustomAttribute.optionSet = {id: '12'};
			spyOn(mockedModalAlertsService, 'showModalAlert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("displayOptionUID : The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.", _ModalAlertTypes.dismissibleError));
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the optionSet options of a custom attribute are incorrect", function(done) {
			mockedCustomAttribute.optionSet = {id: '1', options: [{code: '8'}, {code: '9'}, {code: '10'}]};
			spyOn(mockedModalAlertsService, 'showModalAlert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(mockedModalAlertsService.showModalAlert).toHaveBeenCalledWith(new _ModalAlert("displayOptionUID : The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.", _ModalAlertTypes.dismissibleError));
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should be validated as true when custom attribute in dhis is same as in app config", function(done) {
			delete config.CustomAttributes.printFlagUID;
			mockedCustomAttribute.optionSet = {id: '1', options: [{code: '0'}, {code: '1'}, {code: '2'}]};
			spyOn(window, 'alert');
			customAttributeValidationService.validate().then(function(result) {
				expect(result).toEqual([true]);
				done();
			});
			_$rootScope.$digest();
		});

		it("sholud not validate optionSet of custom attribute when it doesn't have options in config", function() {
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
			_$rootScope.$digest();
		})
	});
});