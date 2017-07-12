TallySheets.factory('Template', [ function() {
	return function Template(templateType, data,templateName) {
		this.type = templateType;
		this.data = data;
		this.displayName = templateName;
	}
}]);

TallySheets.factory('TemplateTypes',[function() {
	return {
		dataSet: "DataSet",
		program: "Program"
	}
}]);
