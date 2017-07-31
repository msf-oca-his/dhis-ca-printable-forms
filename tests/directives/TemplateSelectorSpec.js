describe("templateSelector Directive", function() {
	var $controller;
	var $q, $provide;
	var scope;
	var _$rootScope;
	var d2;
	var compile;
	var elements;
	var childScope;
	var mockedPrintableTemplateService;
	var templates;

	beforeEach(function() {
		angular.module('d2HeaderBar', []);

		module("TallySheets", function(_$provide_, $translateProvider) {
			$translateProvider.translations('en', {});
			$provide = _$provide_;
		});

	});

	beforeEach(inject(function(_$controller_, _$q_, $rootScope, $compile) {
		_$rootScope = $rootScope;
		$controller = _$controller_;
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
		$q = _$q_;
		$provide.value('d2', d2);

		templates = [
			{
				type: "DataSet",
				data: "datasetobject",
				dispalyName: "tally_dataset"
			},
			{
				type: "Program",
				data: "programobject",
				displayName: "perPt_program1"
			},
      {
        type: "Program",
        data: "programobject",
        displayName: "perPt_program2"
      }
		];

		mockedPrintableTemplateService = {
			getTemplates: function() {
				return $q.all(templates);
			}
		};
		$provide.value('PrintableTemplateService', mockedPrintableTemplateService);
		validationObject = {}
	}));

	describe("template controller", function() {
		beforeEach(function() {
			childScope.testRenderDataSets = jasmine.createSpy('testSpy');
			childScope.testTemplate = {};
			childScope.validationProcess = $q.when({showAllTemplates: true})
		});

		describe("Assign templates", function() {
			it("should assign templates and dataset templates from the template service to scope variable", function() {
				childScope.validationResult = $q.when({});
				elements = angular.element('<template-selector on-select-dataset= "testRenderDataSets()" selected-template="testTemplate" load-after="validationProcess"></template-selector>');
				elements = compile(elements)(childScope);
				childScope.$apply();
				expect(childScope.$$childHead.templates).toEqual(templates);
				expect(childScope.$$childHead.dataSetTemplates).toEqual([templates[0]]);
			});
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
				selectElement.selectedIndex = 1;
				selectElement.dispatchEvent(new Event('change'));
				childScope.$apply();
				setTimeout(function() {
					childScope.$apply();
					expect(childScope.change).toHaveBeenCalledWith([templates[0]]);
					done();
				}, 1);
			});

			it("should call onChange with action select and position 0 when first dataset is selected", function(done){
        childScope.selectedTemplatesType = 'testType';
        childScope.change = jasmine.createSpy("changespy");
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.$apply();
        var selectElement = elements[0].querySelector('select')
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          expect(childScope.change).toHaveBeenCalledWith([templates[0]], 'select', 0);
          done();
        }, 1);
			});

      it("should call onChange with action select and position 1 when second dataset is selected", function(done){
        childScope.change = jasmine.createSpy("change");
        childScope.showMultipleTemplates = true;
        childScope.testTemplate = "DATASET";
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.showAllTemplates = false;
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        var button = elements[0].getElementsByTagName('button');
        button[0].click();
        childScope.$apply();
        var selectElement = elements[0].querySelectorAll('select').item(1);
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          console.log(childScope.$$childHead.selectedTemplates)
          expect(childScope.change).toHaveBeenCalledWith([templates[0], templates[0]], 'select', 1);
          done();
        }, 1);
      });

      it("should call onChange with action delete and position 0 when first dataset is deleted", function(done){
        childScope.change = jasmine.createSpy("change");
        childScope.showMultipleTemplates = true;
        childScope.testTemplate = "DATASET";
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.showAllTemplates = false;
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        var button = elements[0].getElementsByTagName('button');
        button[0].click();
        childScope.$apply();
        var selectElement = elements[0].querySelectorAll('select').item(1);
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        console.log(elements[0].querySelectorAll('span .glyphicon-remove').length);
        var deleteElement = elements[0].querySelectorAll('span .glyphicon-remove').item(0);
        deleteElement.click();
        childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          expect(childScope.change).toHaveBeenCalledWith([templates[0]], 'remove', 0);
          done();
        }, 1);
      });

      it("should call onChange with action delete and position 1 when second dataset is deleted", function(done){
        childScope.change = jasmine.createSpy("change");
        childScope.showMultipleTemplates = true;
        childScope.testTemplate = "DATASET";
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.showAllTemplates = false;
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        var button = elements[0].getElementsByTagName('button');
        button[0].click();
        childScope.$apply();
        var selectElement = elements[0].querySelectorAll('select').item(1);
        selectElement.selectedIndex = 1;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        console.log(elements[0].querySelectorAll('span .glyphicon-remove').length);
				var deleteElement = elements[0].querySelectorAll('span .glyphicon-remove').item(1);
				deleteElement.click();
				childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          expect(childScope.change).toHaveBeenCalledWith([templates[0]], 'remove', 1);
          done();
        }, 1);
      });

      it("should call onChange with action select and position 0 when first program is selected", function(done){
        childScope.change = jasmine.createSpy("change");
        childScope.showMultipleTemplates = false;
        childScope.testTemplate = "PROGRAM";
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.showAllTemplates = true;
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 2;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          expect(childScope.change).toHaveBeenCalledWith([templates[1]], 'select', 0);
          done();
        }, 1);
      });

      it("should call onChange with action select and position 0 when selecting program for second time", function(done){
        childScope.change = jasmine.createSpy("change");
        childScope.showMultipleTemplates = false;
        childScope.testTemplate = "PROGRAM";
        elements = angular.element('<template-selector on-change= "change(selectedTemplates, action, position)" selected-templates-type="testTemplate" load-after="validationProcess"></template-selector>');
        elements = compile(elements)(childScope);
        childScope.showAllTemplates = true;
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 2;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        var selectElement = elements[0].querySelector('select');
        selectElement.selectedIndex = 3;
        selectElement.dispatchEvent(new Event('change'));
        childScope.$apply();
        setTimeout(function() {
          childScope.$apply();
          expect(childScope.change).toHaveBeenCalledWith([templates[2]], 'select', 0);
          done();
        }, 1);
      });
		});
	});
});