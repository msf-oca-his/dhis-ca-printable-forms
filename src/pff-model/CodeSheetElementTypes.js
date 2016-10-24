TallySheets.factory('CodeSheetElementTypes', [function() {
	return {
		CodeSheetLabel: function(code, label) {
			this.code = code;
			this.label = label;
			this.type = 'LABEL';
		},
		CodeSheetHeading: function(heading) {
			this.code = 'Code';
			this.label = heading;
			this.type = 'HEADING'
		},
		CodeSheetGap: function() {
			this.code = '';
			this.label = '';
			this.type = 'GAP'
		}
	}
}]);