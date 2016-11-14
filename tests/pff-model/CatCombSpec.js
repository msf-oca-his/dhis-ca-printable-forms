xdescribe("addLineBreakAfterEachCategoryOption", function() {
	var testSection;
	beforeEach(function() {
		testSection = {
			testKey: [{
				categoryCombo: {
					categoryOptionCombos: ["test,String1,", "test,String2,", "test, String3"]
				}
			}]
		};
	});
	it("should replace all , with <br>s", function() {
		printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
		expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
	});

	it("should replace , with <br>s in all categoryOptionCombos", function() {
		printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
		expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[0]).toEqual("test<br>String1<br>");
		expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[1]).toEqual("test<br>String2<br>");
		expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[2]).toEqual("test<br> String3");
	});

	it("should not replace any other character", function() {
		var testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()./>?:;'|\]}[{')\",";
		testSection.testKey[0].categoryCombo.categoryOptionCombos.push(testString);
		printFriendlyUtils.addLineBreakAfterEachCategoryOption(testSection, "testKey");
		expect(testSection.testKey[0].categoryCombo.categoryOptionCombos[3]).toEqual(testString.replace(",", "<br>"));
	})
});