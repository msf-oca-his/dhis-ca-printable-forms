TallySheets.directive('textField', function() {
	return {
		restrict: 'E',
		template: require('./textFieldView.html'),
		scope: {
			content: '='
		}
	}
});