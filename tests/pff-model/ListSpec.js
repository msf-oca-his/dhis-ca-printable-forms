xdescribe("createOptionSetSection", function() {
	var testSection;
	beforeEach(function() {
		testSection = {
			testKey: [
				{
					options: []
				}
			]
		};
	});
	it("should add empty array as rows when there are no options", function() {
		var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey")
		expect(actualSection.testKey[0].rows).toEqual([]);
	});

	it("should place a max of 3 options in each row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push(i)
		var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
		expect(actualSection.testKey[0].rows.length).toEqual(33);
		expect(actualSection.testKey[0].rows[32].length).toEqual(2);
	});

	it("should make sure that no option is left unassigned to its relevant row", function() {
		for(var i = 0; i < 98; i++)
			testSection.testKey[0].options.push(i)
		var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
		var val = Math.floor(98 / 3) + 1;
		for(var i = 0; i < 98; i++) {
			expect((actualSection.testKey[0].rows[Math.floor(i / 3)])[i % 3]).toBe(val * (i % 3) + Math.floor(i / 3));
		}
	});
	it("should add isOptionSet property to the section", function() {
		var actualSection = printFriendlyUtils.createOptionSetSection(testSection, "testKey");
		expect(actualSection.isOptionSet).toBe(true)
	})
});
