describe("CatCombContent", function() {
	var testSection, CatCombContent;
	beforeEach(function() {
		module("TallySheets");
		config = {
			Delimiters: {
				categoryOptionComboDelimiter: "<br>"
			}
		};
		module(function($provide) {
			$provide.value('Config', config);
		});
		inject(function(_CatCombContent_) {
			CatCombContent = _CatCombContent_;
		});
		testSection = {
			dataElements: [{
				categoryCombo: {
					categoryOptionCombos: ["test,String1,", "test,String2,", "test, String3"]
				}
			}]
		};
	});
	it("should replace all , with <br>s", function() {
		var catCombContent = new CatCombContent(testSection)
		expect(catCombContent.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
	});

	it("should replace , with <br>s in all categoryOptionCombos", function() {
		var catCombContent = new CatCombContent(testSection)
		expect(catCombContent.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
		expect(catCombContent.categoryOptionCombos[1]).toEqual("test<br>String2<br>");
		expect(catCombContent.categoryOptionCombos[2]).toEqual("test<br> String3");
	});

	it("should not replace any other character", function() {
		var testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()./>?:;'|\]}[{')\",";
		testSection.dataElements[0].categoryCombo.categoryOptionCombos.push(testString);
		var catCombContent = new CatCombContent(testSection)
		expect(catCombContent.categoryOptionCombos[3]).toEqual(testString.replace(",", "<br>"));
	})
});