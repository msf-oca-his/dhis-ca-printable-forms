TallySheets.service('TemplatesToJsTreeNodesService', ['DataSetAttributes', 'ProgramAttributes', function(DataSetAttributes, ProgramAttributes) {

	var node = function(id, text, index, childNodes) {
		return {
			'id': id,
			'text': text,
			'state': {'opened': true, 'selected': true},
			'index': index,
			'children': childNodes
		};
	};

	var getNodesFrom = function(template, attributes) {
		var childNodes = _.map(_.get(template,attributes.SECTIONS), function(section, index) {
			var childNodes = _.map(section[attributes.DATAELEMENTS], function(dataElement, index) {
				return node(dataElement.id, dataElement.displayFormName, index, []);
			});
			return node(section.id, section.displayName, index, childNodes);
		});
		return node(template.id, template.displayName, attributes.TEMPLATE, childNodes);
	};

	this.getJsTreeNodes = function(template, templateType) {
		return (templateType == "DATASET") ? getNodesFrom(template, new DataSetAttributes()) : getNodesFrom(template, new ProgramAttributes());
	}
}]);
