/**
 * Created by durgaman on 8/25/16.
 */

describe("CustomAttributeValidationService", function() {
	var customAttributeService = {};
	var httpMock;
	var window;
	var _$rootScope;
	var config;
	var customAttribute;
	var customAttributes;
	var customAttributeValidationService;

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

		angular.module('d2HeaderBar', []);
		module("TallySheets", function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('CustomAttributeService', customAttributeService);
			$translateProvider.translations('en', {
				"NO_ATTRIBUTE_EXISTS": "The specified UID doesn't exist in the system. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_OPTIONSET": "The specified attribute is not associated with any optionSet. Please contact your system administrator.",
				"OPTIONSET_WITHOUT_OPTIONS": "The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.",
				"OPTIONSET_WITH_INCORRECT_OPTIONS": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_DATAELEMENT": "The specified attribute of type optionSet is not assigned to any dataElement. Please contact your system administrator",
				"NO_ASSOCIATION_WITH_ATTRIBUTE": "The specified UID exists in the system, but is not assigned to any template. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_ENTITY": "No association between the attribute and the specified entity in config"
			});
		});
	});

	beforeEach(inject(function($rootScope, $httpBackend, $window, CustomAttribute, CustomAttributeValidationService) {
		_$rootScope = $rootScope;
		httpMock = $httpBackend;
		window = $window;
		httpMock.expectGET("i18n/en.json").respond(200, {});
		customAttribute = CustomAttribute;
		customAttributeValidationService = CustomAttributeValidationService;

		customAttributes = [
			new customAttribute({
				name: "displayOptions",
				id: "1",
				displayName: "displayOptions",
				dataElementAttribute: true,
				options: [{code: '0'}, {code: '1'}, {code: '2'}]
			}),
			new customAttribute({
				name: "isPrintable",
				id: "2",
				displayName: "isPrintable",
				dataSetAttribute: true,
				programAttribute: true
			})
		]
	}));

	beforeEach(function() {
		customAttributeService.getCustomAttribute = function() {
			return Promise.resolve(customAttributes)
		};
	});

	describe("validation of all custom attributes", function() {
		it("should be undefined when no custom attributes in config", function() {
			config.CustomAttributes = undefined;
			expect(customAttributeValidationService.validate()).toEqual(undefined);
			_$rootScope.$digest();
		});

		it("should show an alert when specified display custom attribute is not present in dhis", function(done) {
			customAttributes = [];
			spyOn(window, 'alert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("displayOptionUID : The specified UID doesn't exist in the system. Please contact your system administrator.")
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when there is no association between custom attribute and any entity", function(done) {
			customAttributes = customAttributes[0];
			customAttributes.optionSet = undefined;
			customAttributes.dataElementAttribute = false;
			spyOn(window, 'alert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("displayOptionUID : No association between the attribute and the specified entity in config");
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the custom attribute is not associated with optionSet", function(done) {
			customAttributes = customAttributes[0];
			customAttributes.optionSet = undefined;
			spyOn(window, 'alert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("displayOptionUID : The specified attribute is not associated with any optionSet. Please contact your system administrator.")
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the optionSet of attribute doesn't have options", function(done) {
			customAttributes = customAttributes[0];
			customAttributes.optionSet = {id: '12'};
			spyOn(window, 'alert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("displayOptionUID : The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.")
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should show an alert when the optionSet options of a custom attribute are incorrect", function(done) {
			customAttributes = customAttributes[0];
			customAttributes.optionSet = {id: '1', options: [{code: '8'}, {code: '9'}, {code: '10'}]};
			spyOn(window, 'alert');
			customAttributeValidationService.validate().catch(function() {
				Promise.resolve({}).then(function() {
					expect(window.alert).toHaveBeenCalledWith("displayOptionUID : The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.")
					done();
				});
				_$rootScope.$digest();
			});
			_$rootScope.$digest();
		});

		it("should be validated as true when custom attribute in dhis is same as in app config", function(done) {
			delete config.CustomAttributes.printFlagUID;
			customAttributes = customAttributes[0];
			customAttributes.optionSet = {id: '1', options: [{code: '0'}, {code: '1'}, {code: '2'}]};
			spyOn(window, 'alert');
			customAttributeValidationService.validate().then(function(result) {
				expect(result).toEqual([true]);
				done();
			});
			_$rootScope.$digest();
		});

		it("sholud not validate optionSet of custom attribute when it doesn't have options in config", function() {
			delete config.CustomAttributes.displayOptionUID;
			customAttributes = customAttributes[1];
			customAttributeValidationService.validate().then(function(result) {
				expect(result).toEqual([true]);
				done();
			});
			_$rootScope.$digest();
		})
	});
});