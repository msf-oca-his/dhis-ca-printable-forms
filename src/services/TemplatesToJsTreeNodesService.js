TallySheets.service('TemplatesToJsTreeNodesService', ['$q', 'DataSetAttributes', 'ProgramAttributes', 'TemplateTypes', function($q, DataSetAttributes, ProgramAttributes, TemplateTypes) {

	var node = function(id, text, path, childNodes) {
		return {
			'id': id,
			'text': text,
			'state': {'opened': true, 'selected': true},
			'path': path,
			'children': childNodes
		};
	};

	var createPath = function(string1, joinParam, string2, index) {
		return string1.concat(joinParam + string2 + "[" + index + "]");
	};

	var getNodesFrom = function(template, attributes) {
		var childNodes = _.map(_.get(template,attributes.SECTIONS), function(section, index) {
			var sectionPath = createPath(attributes.TEMPLATE, ".", attributes.SECTIONS, index);
			var childNodes = _.map(section[attributes.DATAELEMENTS], function(dataElement, index) {
				var dataElementPath = createPath(sectionPath, ".", attributes.DATAELEMENTS, index);
				return node(dataElement.id, dataElement.displayFormName, dataElementPath, []);
			});
			return node(section.id, section.displayName, sectionPath, childNodes);
		});
		return node(template.id, template.displayName, attributes.TEMPLATE, childNodes);
	};

	this.getJsTreeNodes = function(template, templateType) {
		return (templateType == "DATASET") ? getNodesFrom(template, new DataSetAttributes()) : getNodesFrom(template, new ProgramAttributes());
	}
}]);
