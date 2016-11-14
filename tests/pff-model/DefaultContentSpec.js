xdescribe("splitLeftAndRightElements", function() {
	var testSections;
	beforeEach(function() {
		testSections = [{
			testKey: []
		}];
	});

	describe(" when number of data elements are zero", function() {
		it("should have empty left and right side elements", function(){
			printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
			expect(testSections[0].leftSideElements).toEqual([]);
			expect(testSections[0].rightSideElements).toEqual([]);
		});
	});

	describe("when number of data elements are even", function() {
		it("should split data elements into left and right side elements equally ", function(){
			testSections[0].testKey = [1, 2, 3, 4];
			printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
			expect(testSections[0].leftSideElements.length).toEqual(testSections[0].rightSideElements.length);
			expect(testSections[0].leftSideElements).toEqual([1, 2]);
			expect(testSections[0].rightSideElements).toEqual([3, 4]);
		});
	});

	describe("when number of data elements are odd", function() {
		it("should have left side elements more than right side elements ", function(){
			testSections[0].testKey = [1, 2, 3, 4, 5];
			printFriendlyUtils.splitLeftAndRightElements(testSections[0], "testKey");
			expect(testSections[0].leftSideElements.length).toBe(3);
			expect(testSections[0].rightSideElements.length).toBe(2);
			expect(testSections[0].leftSideElements).toEqual([1, 2, 3]);
			expect(testSections[0].rightSideElements).toEqual([4, 5]);
		});
	});
});