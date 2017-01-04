TallySheets.directive('pageContent', ['$compile', function($compile) {
	return {
		restrict: 'AE',
		template: '',
		scope: {
			content: '='
		},
		link: function($scope, element) {
			var getElementHTML = function(elementName) {
				return "<" + elementName + " content='content.data'></" + elementName + "/>";
			};
			var contentElement = $compile(angular.element(getElementHTML($scope.content.type.renderer)))($scope);
			element.append(contentElement);
		}
	};
}]);
