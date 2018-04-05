TallySheets.factory('CommentField', [function() {
	return function CommentField(dataElement, height) {
		this.name = "comment-field";
		this.displayFormName = dataElement.displayFormName;
		this.valueType = dataElement.valueType;
		this.greyField = false;
		this.height = height;
	}
}]);