TallySheets.service('TemplatesToJsTreeNodesService', ['DataSetAttributes', 'ProgramAttributes', 'TreeNodeTypes', function(DataSetAttributes, ProgramAttributes, TreeNodeTypes) {

	var node = function(id, text, index, type, childNodes, disabled) {
		return {
			'id': id,
			'text': text,
			'state': {'opened': true, 'selected': true, disabled: disabled},
			'index': index,
			'children': childNodes,
			type: type
		};
	};

	var getNodesFrom = function(template, attributes) {
		var childNodes = _.map(_.get(template,attributes.SECTIONS), function(section, index) {
			var childNodes = _.map(section[attributes.DATAELEMENTS], function(dataElement, index) {
				return node(dataElement.id, dataElement.displayFormName, index, TreeNodeTypes.DATAELEMENT,[]);
			});
			return node(section.id, section.displayName, index, TreeNodeTypes.SECTION, childNodes);
		});
		return node(template.id, template.displayName, 0, TreeNodeTypes.TEMPLATE, childNodes, true);
	};

	this.getJsTreeNodes = function(template, templateType) {
		return (templateType == "DATASET") ? getNodesFrom(template, new DataSetAttributes()) : getNodesFrom(template, new ProgramAttributes());
	}
}]);

TallySheets.factory('TreeNodeTypes', function(){
	return {
			TEMPLATE: 'template',
			SECTION: 'section',
			DATAELEMENT: 'dataelement'
	}
});