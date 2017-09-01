TallySheets.directive('defaultRenderer', ['$compile', 'DefaultContentTypes', function($compile, DefaultContentTypes) {
	return {
		restrict: 'AE',
		template: '',
		scope: {
			content: '='
		},
		link: function($scope, element) {
			var getElementHTML = function(elementName) {
				return "<" + elementName + " element='content'></" + elementName + "/>";
			};
			var renderedTypeName = _.get(DefaultContentTypes, $scope.content.valueType).renderer;
			var contentElement = $compile(angular.element(getElementHTML(renderedTypeName)))($scope);
			element.append(contentElement);
		}
	};
}]);