TallySheets.factory('CodeSheetElementTypes', [function() {
	return {
		LABEL: 'LABEL',
		HEADING: 'HEADING',
		GAP: 'GAP'
	}
}]);

TallySheets.factory('CodeSheetElements', ['Config', 'CommonUtils', 'CodeSheetElementTypes', function(config, commonUtils, CodeSheetElementTypes) {
	return {
		CodeSheetLabel: function(code, label) {
			this.code = code;
			this.label = _.trim(commonUtils.getRightPartOfSplit(label, config.Delimiters.optionLabelDelimiter));
			this.type = CodeSheetElementTypes.LABEL;
		},
		CodeSheetHeading: function(heading) {
			this.code = 'Code';
			this.label = heading;
			this.type = CodeSheetElementTypes.HEADING;
		},
		CodeSheetGap: function() {
			this.code = '';
			this.label = '';
			this.type = CodeSheetElementTypes.GAP;
		}
	}
}]);

