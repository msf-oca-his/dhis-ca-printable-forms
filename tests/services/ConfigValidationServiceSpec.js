/**
 * Created by durgaman on 8/25/16.
 */

describe("ConfigValidationService", function() {
	var customAttributeService = {};
	var httpMock;
	var window;
	var _$rootScope;
	var config;
	var customAttribute;
	var customAttributes;
	var configValidationService;

	beforeEach(function() {
		config = {
			Prefixes: {
				dataSetPrefix: "test_DS",
				programPrefix: "test_PROG_"
			},
			CustomAttributes: {}
		};
	});

	beforeEach(function() {
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
				"NO_ASSOCIATION_WITH_ATTRIBUTE": "The specified UID exists in the system, but is not assigned to any template. Please contact your system administrator."
			});
		});
	});

	beforeEach(inject(function($rootScope, $httpBackend, $window, CustomAttribute, ConfigValidationService) {
		_$rootScope = $rootScope;
		httpMock = $httpBackend;
		window = $window;
		httpMock.expectGET("i18n/en.json").respond(200, {});
		customAttribute = CustomAttribute;
		configValidationService = ConfigValidationService;

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

	beforeEach(function() {
		customAttributeService.getCustomAttribute = function() {
			return Promise.resolve(customAttributes[0])
		};
	});

	describe("no print flag attribute and no display option attribute ", function() {
		it("should set the show all templates variable to true", function() {
			configValidationService.validate().then(function(validationObject) {
				expect(validationObject.showAllTemplates).toEqual(true);
			})
		})
	});

	describe("print flag attribute and no display option attribute ", function() {
		it("should show an alert when printable attribute is not present in system", function(done) {
			config.CustomAttributes.printFlagUID = "1";
			spyOn(window, 'alert');
			customAttributes[0] = {};
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified UID doesn't exist in the system. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should show an alert when there is no association between attribute and template", function(done) {
			config.CustomAttributes.printFlagUID = "1";
			customAttributes[0].dataSetAttribute = false;
			customAttributes[0].programAttribute = false;
			spyOn(window, 'alert');
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified UID exists in the system, but is not assigned to any template. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should set the show all templates variable to false when there is valid printable attribute", function(done) {
			config.CustomAttributes.printFlagUID = "1";
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(validationObject.showAllTemplates).toEqual(false);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		})
	});

	describe("no printable attribute and display options attribute", function() {
		it("should show an alert when display option attribute is not present in the system", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			spyOn(window, 'alert');
			customAttributes[0] = {};
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified UID doesn't exist in the system. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should show an alert when display option attribute is not associated with optionSet", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			spyOn(window, 'alert');
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified attribute is not associated with any optionSet. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should show an alert when display option attribute associated with optionSet and it doesn't have options", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			customAttributes[0].optionSet = {id: "1", name: "option1"};
			spyOn(window, 'alert');
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should show an alert when display option attribute associated with optionSet and it has incorrect options", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			config.DisplayOptions = {
				none: '0',
				text: '1',
				list: '2'
			};
			customAttributes[0].optionSet = {
				id: "1",
				name: "option1",
				options: [{code: "1"}, {code: "5"}, {code: "9"}]
			};
			spyOn(window, 'alert');
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should show an alert when display option attribute associated with optionSet with correct options and no association with dataelement", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			customAttributes[0].dataElementAttribute = false;
			config.DisplayOptions = {
				none: '0',
				text: '1',
				list: '2'
			};
			customAttributes[0].optionSet = {
				id: "1",
				name: "option1",
				options: [{
					code: "0"
				},
					{code: "1"},
					{code: "2"}
				]
			};
			spyOn(window, 'alert');
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet is not assigned to any dataElement. Please contact your system administrator");
						expect(validationObject.alertShown).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});

		it("should set show all templates to true when it has valid display attribute", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			customAttributes[0].dataElementAttribute = true;
			config.DisplayOptions = {
				none: '0',
				text: '1',
				list: '2'
			};
			customAttributes[0].optionSet = {
				id: "1",
				name: "option1",
				options: [{
					code: "0"
				},
					{code: "1"},
					{code: "2"}
				]
			};
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(validationObject.showAllTemplates).toEqual(true);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});
	});

	describe("printable attribute and display options attribute are present in config", function() {
		it("should set show all templates to false when display attribute and printable attribute are valid", function(done) {
			config.CustomAttributes.displayOptionUID = "1";
			config.CustomAttributes.printFlagUID = "1";
			customAttributes[0].dataElementAttribute = true;
			config.DisplayOptions = {
				none: '0',
				text: '1',
				list: '2'
			};
			customAttributes[0].optionSet = {
				id: "1",
				name: "option1",
				options: [{
					code: "0"
				},
					{code: "1"},
					{code: "2"}
				]
			};
			configValidationService.validate().then(function(validationObject) {
				Promise.resolve({})
					.then(function() {
						expect(validationObject.showAllTemplates).toEqual(false);
						done();
					});
				_$rootScope.$digest();
			});
			setInterval(_$rootScope.$digest, 900)
		});
	})
});