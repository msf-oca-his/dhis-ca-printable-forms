describe("DefaultContent", function() {
	var testSections;
	var DefaultContent;
	beforeEach(function() {
		module("TallySheets");
		inject(function(_DefaultContent_) {
			DefaultContent = _DefaultContent_;
		});

		testSections = [{
			displayName:"section",
			testKey: []
		}];
	});

	describe(" when number of data elements are zero", function() {
		it("should have empty left and right side elements", function(){
			var actualContent = new DefaultContent(testSections[0], "testKey");
			expect(actualContent.leftSideDataElements).toEqual([]);
			expect(actualContent.rightSideDataElements).toEqual([]);
		});

		it("should have section title", function(){
			var actualContent = new DefaultContent(testSections[0], "testKey");
			expect(actualContent.title).toEqual("section");
		});
	});

	describe("when number of data elements are even", function() {
		it("should split data elements into left and right side elements equally ", function(){
			var de1 = {name:'de1',valueType:'value1'};
			var de2 = {name:'de2',valueType:'value2'};
			var de3 = {name:'de3',valueType:'value3'};
			var de4 = {name:'de4',valueType:'value4'};
			testSections[0].testKey = [de1,de2,de3,de4];
			var actualContent = new DefaultContent(testSections[0], "testKey");
			expect(actualContent.leftSideDataElements.length).toEqual(2);
			expect(actualContent.rightSideDataElements.length).toEqual(2);
			expect(actualContent.leftSideDataElements[0]).toEqual(de1,de2);
			expect(actualContent.rightSideDataElements[0]).toEqual(de3,de4);
		});
	});

	describe("when number of data elements are odd", function() {
		it("should have left side elements more than right side elements ", function(){
			var de1 = {name:'de1',valueType:'value1'};
			var de2 = {name:'de2',valueType:'value2'};
			var de3 = {name:'de3',valueType:'value3'};
			var de4 = {name:'de4',valueType:'value4'};
			var de5 = {name:'de5',valueType:'value5'};
			testSections[0].testKey = [de1,de2,de3,de4,de5];
			var actualContent = new DefaultContent(testSections[0], "testKey");
			expect(actualContent.leftSideDataElements.length).toBe(3);
			expect(actualContent.rightSideDataElements.length).toBe(2);
			expect(actualContent.leftSideDataElements[0]).toEqual(de1,de2,de3);
			expect(actualContent.rightSideDataElements[0]).toEqual(de4,de5);
		});
	});
});