describe("templateSelector Directive", function() {
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
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		config = {
			Prefixes: {
				dataSetPrefix: "test_DS",
				programPrefix: "test_PROG_"
			},
			CustomAttributes: {}
		};

		module("TallySheets", function($provide, $translateProvider) {
			$provide.value('Config', config);
			$provide.value('d2', d2);
			$provide.value('DataSetService', dataSetService);
			$provide.value('ProgramService', programService);
			$provide.value('CustomAttributeService', customAttributeService);
			$translateProvider.translations('en', {
				"NO_ATTRIBUTE_EXISTS": "The specified UID doesn't exist in the system. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_OPTIONSET": "The specified attribute is not associated with any optionSet. Please contact your system administrator.",
				"OPTIONSET_WITHOUT_OPTIONS": "The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.",
				"OPTIONSET_WITH_INCORRECT_OPTIONS": "The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.",
				"NO_ASSOCIATION_WITH_DATAELEMENT": "The specified attribute of type optionSet is not assigned to any dataElement. Please contact your system administrator"
			});
		});
	});

	beforeEach(inject(function(_$controller_, $q, $rootScope, $httpBackend, $window, _$timeout_, $compile, DataSet, Program, CustomAttribute) {
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
		});

		describe("no printable uid and display option uid in config", function() {
			it("should load all the templates when print flag uid and display option uid are not present in config", function(done) {
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
								done();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});
		});

		describe("printabe uid and no display option uid in config", function() {
			it("should load all templates which has print uid attribute value as true and display option uid not there in config", function(done) {
				config.CustomAttributes.printFlagUID = "1";
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve().then(function() {
									Promise.resolve().then(function() {
										Promise.resolve().then(function() {
											expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
											done();
										});
										scope.$digest();
									});
									scope.$digest();
								});
								scope.$digest();
							});
						scope.$digest();
					});
				scope.$digest();
			});
		});

		describe("no printable uid and display option uid in config", function() {

			it("should show an alert when display option attribute is not present in system", function(done) {
				customAttributes[0] = {};
				spyOn(window, 'alert');
				config.CustomAttributes.displayOptionUID = "3";
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve({})
									.then(function() {
										expect(window.alert).toHaveBeenCalledWith("The specified UID doesn't exist in the system. Please contact your system administrator.");
										done();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});

			it("should show an alert when there is no association between display option attribute and optionset and there is no printable uid ", function(done) {
				spyOn(window, 'alert');
				config.CustomAttributes.displayOptionUID = "3";
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve({})
									.then(function() {
										expect(window.alert).toHaveBeenCalledWith("The specified attribute is not associated with any optionSet. Please contact your system administrator.");
										done();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});

			it("should show an alert when The specified attribute of type optionSet doesn't have any options and there is no printable uid ", function(done) {
				customAttributes[0].optionSet = {id: "optionSetId"};
				spyOn(window, 'alert');
				config.CustomAttributes.displayOptionUID = "3";
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve({})
									.then(function() {
										expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet doesn't have any options. Please contact your system administrator.");
										done();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});

			it("should show an alert when The specified attribute of type optionSet's options are incorrect and there is no printable uid ", function(done) {
				customAttributes[0].optionSet = {
					id: "optionSetId",
					options: [
						{
							code: "0"
						}, {
							code: "3"
						},
						{
							code: "2"
						}
					]
				};
				spyOn(window, 'alert');
				config.CustomAttributes.displayOptionUID = "3";
				config.DisplayOptions = {
					none: '0',
					text: '1',
					list: '2'
				};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve({})
									.then(function() {
										expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet's options are incorrect. Please contact your system administrator.");
										done();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});

			it("should show an alert when The specified attribute of type optionSet is not assigned to any dataElement and there is no printable uid ", function(done) {
				customAttributes[0].optionSet = {
					id: "optionSetId",
					options: [
						{
							code: "0"
						}, {
							code: "1"
						},
						{
							code: "2"
						}
					]
				};
				customAttributes[0].dataElementAttribute = false;
				spyOn(window, 'alert');
				config.CustomAttributes.displayOptionUID = "3";
				config.DisplayOptions = {
					none: '0',
					text: '1',
					list: '2'
				};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve()
							.then(function() {
								Promise.resolve({})
									.then(function() {
										expect(window.alert).toHaveBeenCalledWith("The specified attribute of type optionSet is not assigned to any dataElement. Please contact your system administrator");
										done();
									})
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			});

			it("should render the all templates when all validations of display option uid are passed", function(done) {
				customAttributes[0].optionSet = {
					id: "optionSetId",
					options: [
						{
							code: "0"
						}, {
							code: "1"
						},
						{
							code: "2"
						}
					]
				};
				customAttributes[0].dataelementAttribute = true;
				config.CustomAttributes.displayOptionUID = "3";
				config.DisplayOptions = {
					none: '0',
					text: '1',
					list: '2'
				};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve({})
							.then(function() {
								Promise.resolve({})
									.then(function() {
										Promise.resolve({})
											.then(function() {
												Promise.resolve({})
													.then(function() {
														expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
														done();
													})
											});
										_$rootScope.$digest();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();
			})

		});

		describe("print flag uid and display option uid present", function() {
			it("should render templates which passes both validations", function() {
				customAttributes[0].optionSet = {
					id: "optionSetId",
					options: [
						{
							code: "0"
						}, {
							code: "1"
						},
						{
							code: "2"
						}
					]
				};
				customAttributes[0].dataelementAttribute = true;
				config.CustomAttributes.printFlagUID = "1";
				config.CustomAttributes.displayOptionUID = "3";
				config.DisplayOptions = {
					none: '0',
					text: '1',
					list: '2'
				};
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				Promise.resolve({})
					.then(function() {
						Promise.resolve({})
							.then(function() {
								Promise.resolve({})
									.then(function() {
										Promise.resolve({})
											.then(function() {
												Promise.resolve({})
													.then(function() {
														expect(scope.$$childHead.templates).toEqual(datasets.concat(programs));
														done();
													})
											});
										_$rootScope.$digest();
									});
								_$rootScope.$digest();
							});
						_$rootScope.$digest();
					});
				_$rootScope.$digest();

			})

		});

		it("should not load templates which has attribute value as false", function(done) {
			config.CustomAttributes.printFlagUID = "1";
			datasets[0].attributeValues[0].value = "false";
			programs[0].attributeValues[0].value = "false";
			elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
			elements = compile(elements)(scope);
			scope.$digest();
			expectedDataSets = _.clone(datasets);
			expectedPrograms = _.clone(programs)
			expectedDataSets.splice(0, 1);
			expectedPrograms.splice(0, 1);

			Promise.resolve({})
				.then(function() {
					Promise.resolve()
						.then(function() {
							Promise.resolve().then(function() {
								Promise.resolve().then(function() {
									Promise.resolve().then(function() {
										expect(scope.$$childHead.templates).toEqual(expectedDataSets.concat(expectedPrograms));
										done();

									})
									scope.$digest();
								})
								scope.$digest();
							})
							scope.$digest();
						});
					scope.$digest();
				});
			scope.$digest();
		});

		describe("On selecting a  template", function() {
			//TODO: pending testcases
			xit("should show the hour glass icon until templates are loaded", function() {})
			xit("should remove the hour glass icon after templates are loaded", function() {})

			it("should update selectedTemplate", function(done) {
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate"></template-selector>');
				elements = compile(elements)(scope);
				scope.$digest();
				var selectElement = elements[0].querySelector('select')
				Promise.resolve({})
					.then(function() {
						Promise.resolve({})
							.then(function() {
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