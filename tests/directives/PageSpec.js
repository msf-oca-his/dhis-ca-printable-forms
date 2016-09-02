describe("Page Directive", function() {
	var $controller;
	var section;
	var PageElement;
	var outerScope, compile;
	var config = {
		CustomAttributes: {
			displayOptionUID: {
				id: "444",
				options: {
					none: '0',
					text: '1',
					list: '2'
				}
			}
		}
	};
	beforeEach(function() {
		module("TallySheets");
		angular.module('d2HeaderBar', []);
		config  = {CustomAttributes: {
			displayOptionUID:{}
		}};
		module(function($provide) {
			$provide.value('Config', config);
		});
	});

	beforeEach(inject(function(_$controller_, $compile, $rootScope, $httpBackend) {
		$httpBackend.expectGET("i18n/en.json").respond(200, {});
		$controller = _$controller_;
		outerScope = $rootScope.$new();
		compile = $compile;
		outerScope.testPage = "testPage"
		outerScope.testIndex = 5;
		outerScope.testTotalPages = 7;
	}));

	beforeEach(function() {
		section = {
			dataElements: [{
				id: "1234",
				isResolved: Promise.resolve({}),
				name: "dataElement",
				type: "TEXT",
				categoryCombo: {}
			}],
			id: "134",
			isResolved: Promise.resolve({}),
			name: "section"
		}
	});

	describe("when page type is dataset", function() {

		beforeEach(function() {
			outerScope.testTemplateType = "DATASET";
			outerScope.testProgramMode = "";
			PageElement = compile('<page class="page" page="testPage" page-number="testIndex" total-pages="testTotalPages" type="testTemplateType" program-mode="testProgramMode"></page>')(outerScope)
			outerScope.$apply();
		});

		it("should render dataset and not program", function() {
			expect(_.isEmpty(PageElement[0].querySelector('template-dataset'))).toBe(false)
			expect(_.isEmpty(PageElement[0].querySelector('template-program'))).toBe(true)
		});

		it("should render page number", function() {
			expect(PageElement[0].querySelector('.page-number').innerText.trim()).toBe("Page 5 of 7")
		});

		it("should assign page.content and page.datasetName to dataset directive", function() {
			datasetElement = PageElement[0].querySelector('template-dataset');
			expect(datasetElement.getAttribute('contents')).toBe("page.contents");
			expect(datasetElement.getAttribute('dataset-name')).toBe("page.datasetName")
		})
	});

	describe("when page type is program", function() {

		beforeEach(function() {
			outerScope.testTemplateType = "PROGRAM";
			outerScope.testProgramMode = "COVERSHEET";
			PageElement = compile('<page class="page" page="testPage" page-number="testIndex" total-pages="testTotalPages" type="testTemplateType" program-mode="testProgramMode"></page>')(outerScope)
			outerScope.$apply();
		});

		it("should render coversheet only", function() {
			expect(_.isEmpty(PageElement.find('template-dataset'))).toBe(true)
			expect(_.isEmpty(PageElement.find('template-register'))).toBe(true)
			expect(_.isEmpty(PageElement.find('template-coversheet'))).toBe(false)
		});

		it("should render page number", function() {
			expect(PageElement[0].querySelector('.page-number').innerText.trim()).toBe("Page 5 of 7")

		});

		it("should assign page.content, page.programName and programMode to coversheet directive", function() {
			datasetElement = PageElement[0].querySelector('template-coversheet');
			expect(datasetElement.getAttribute('contents')).toBe("page.contents");
			expect(datasetElement.getAttribute('program-name')).toBe("page.programName");
			//  write expect for programMode
		});

		describe("Coversheet mode", function() {
			xit("Page number should contain page instead of part", function() {

			})
		});
		describe("Register mode", function() {
			xit("Page number should contain part instead of page", function() {

			})
		})
	})

});