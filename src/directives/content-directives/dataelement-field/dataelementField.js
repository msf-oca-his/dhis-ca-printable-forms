TallySheets.directive('dataelementField', ['$compile', 'DefaultContentTypes', function($compile, DefaultContentTypes) {
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
			if($scope.content) {
				var contentType = _.get(DefaultContentTypes, $scope.content.valueType);
				var renderer = contentType ? contentType.renderer : DefaultContentTypes.TEXT.renderer;
				var contentElement = $compile(angular.element(getElementHTML(renderer)))($scope);
				element.append(contentElement);
			}

		}
	};
}]);