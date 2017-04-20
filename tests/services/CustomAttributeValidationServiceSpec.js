describe("CustomAttributeValidationService", function() {
	var customAttributeService = {};
	var _$rootScope;
	var config;
	var customAttribute;
	var mockedCustomAttribute;
	var customAttributeValidationService;
	var mockedModalAlertsService;
	var mockedValidationService = {};

	beforeEach(function() {
		config = {
			Prefixes: {
				dataSetPrefix: "test_DS",
				programPrefix: "test_PROG_"
			},
			customAttributes: {
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
			$provide.value('ValidationService', mockedValidationService);
			$translateProvider.preferredLanguage('en');
			$translateProvider.translations('en', {
				"no_attribute_exists": "The specified UID doesn't exist in the system. Please contact your system administrator.",
			});
		});
	});

	beforeEach(inject(function($rootScope, CustomAttribute, CustomAttributeValidationService) {
		_$rootScope = $rootScope;
		customAttribute = CustomAttribute;
		customAttributeValidationService = CustomAttributeValidationService;

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
		mockedValidationService.validateAllAttributes = function(){
			var error = new Error("no_attribute_exists");
			error.errorSrc = "displayOptionUID";
			error.errorCode = "no_attribute_exists";
			return Promise.reject(error)
		}
	});

	describe("validation of all custom attributes", function() {
		it("should be undefined when no custom attributes in config", function() {
			config.customAttributes = undefined;
			expect(customAttributeValidationService.validate()).toEqual(undefined);
			_$rootScope.$digest();
		});

		it("should throw an alert when specified display custom attribute is not present in dhis", function(done) {
			mockedCustomAttribute = {};
			customAttributeValidationService.validate().catch(function(alertObject) {
				expect(alertObject.message).toEqual("displayOptionUID : The specified UID doesn't exist in the system. Please contact your system administrator.");
				done();
			});
			getAngularPromiseOfDepth(10, _$rootScope);
		});
	});
});