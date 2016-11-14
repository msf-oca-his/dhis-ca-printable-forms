TallySheets.factory('CodeSheetElementTypes', ['Config', 'CommonUtils', function(config, commonUtils) {
	return {
		CodeSheetLabel: function(code, label) {
			this.code = code;
			this.label = _.trim(commonUtils.getRightPartOfSplit(label, config.Delimiters.optionLabelDelimiter));
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