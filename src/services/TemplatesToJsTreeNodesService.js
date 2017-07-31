TallySheets.service('TemplatesToJsTreeNodesService', ['$q',function($q) {

	var node = function(id, text, childNodes) {
		return {
			'id': id,
			'text': text,
			'state': {'opened': true,'selected':true},
			'children': childNodes
		};
	};

	this.getJsTreeNodesFrom = function(templates) {
		var nodes =  _.map(templates, function(template) {
			var childNodes = _.map(template.sections, function(section) {
				var childNodes = _.map(section.dataElements, function(dataElement) {
					return node(dataElement.id, dataElement.displayFormName, []);
				});
				return node(section.id, section.displayName, childNodes);
			});
			return node(template.id, template.displayName, childNodes);
		});
		return nodes;
	}
}])
;
