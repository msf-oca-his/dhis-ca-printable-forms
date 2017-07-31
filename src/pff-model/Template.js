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

TallySheets.factory('DataSetAttributes',[function() {
	return function DataSetAttributes() {
		this.TEMPLATE = 'template';
		this.SECTIONS = 'sections';
		this.DATAELEMENTS = 'dataElements';
	}
}]);

TallySheets.factory('ProgramAttributes',[function() {
	return function ProgramAttributes() {
		this.TEMPLATE = 'template';
		this.SECTIONS = 'programStages[0].programStageSections';
		this.DATAELEMENTS = 'programStageDataElements';
	}
}]);
