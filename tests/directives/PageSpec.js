describe("Page Directive", function() {
	var $controller;
	var section;
	var PageElement;
	var outerScope, compile, childScope;
	var config = {
		customAttributes: {
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
		angular.module('d2HeaderBar', []);
		config = {
			customAttributes: {
				displayOptionUID: {}
			},
			Coversheet:{
				maximumCharLengthForHeader: 10
			}
		};

		module("TallySheets", function($provide, $translateProvider) {
			$provide.value('Config', config);
			$translateProvider.translations('en', {
				"page": "Page"
			});
			$translateProvider.use('en');
		});

		inject(function(_$controller_, $compile, $rootScope) {
			$controller = _$controller_;
			outerScope = $rootScope.$new();
			outerScope.PageTypes = {
				COVERSHEET: "COVERSHEET",
				REGISTER: "REGISTER",
				CODESHEET: "CODESHEET",
				DATASET: "DATASET",
				PROGRAM: "PROGRAM"
			};
			childScope = outerScope.$new();
			compile = $compile;
			outerScope.testPage = "testPage";
			outerScope.testIndex = 5;
			outerScope.testTotalPages = 7;
		})
	});

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
			childScope.testPage = {type: 'DATASET'};
			PageElement = compile('<page class="page" page="testPage" page-number="testIndex" total-pages="testTotalPages"></page>')(childScope)
			childScope.$apply();
		});

		xit("should render dataset and not program", function() {
			expect(_.isEmpty(PageElement[0].querySelector('dataset-template'))).toBe(false);
			expect(_.isEmpty(PageElement[0].querySelector('template-program'))).toBe(true)
		});

		it("should render page number", function() {
			expect(PageElement[0].querySelector('.page-number').innerText.trim()).toBe("Page 5 of 7")
		});

		xit("should assign page.content and page.datasetName to dataset directive", function() {
			datasetElement = PageElement[0].querySelector('dataset-template');
			expect(datasetElement.getAttribute('contents')).toBe("page.contents");
			expect(datasetElement.getAttribute('dataset-name')).toBe("page.datasetName")
		})
	});

	describe("when page type is program", function() {

		beforeEach(function() {
			outerScope.testPage = {type: "COVERSHEET"};
			PageElement = compile('<page class="page" page="testPage" page-number="testIndex" total-pages="testTotalPages"></page>')(childScope)
			childScope.$apply();
		});

		xit("should render coversheet only", function() {
			expect(_.isEmpty(PageElement.find('dataset-template'))).toBe(true)
			expect(_.isEmpty(PageElement.find('register-template'))).toBe(true)
			expect(_.isEmpty(PageElement.find('coversheet-template'))).toBe(false)
		});

		it("should render page number", function() {
			expect(PageElement[0].querySelector('.page-number').innerText.trim()).toBe("Page 5 of 7")

		});

		xit("should assign page.content, page.programName and programMode to coversheet directive", function() {
			datasetElement = PageElement[0].querySelector('coversheet-template');
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