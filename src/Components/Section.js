TallySheets.factory('Section', [function() {
	return function Section(height) {
		this.name = "section";
		this.left = {
			height: height,
			components:[]
		};
		this.right = {
			height: height,
			components:[]
		};
	}
}]);