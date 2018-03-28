TallySheets.directive('pageComponent', ['$compile', function($compile) {
	return {
		restrict: 'AE',
		template: '',
		scope: {
			component: '='
		},
		link: function($scope, element) {
			var getElementHTML = function(elementName) {
				return "<" + elementName + " component='component'></" + elementName + "/>";
			};
			var contentElement = $compile(angular.element(getElementHTML($scope.component.name)))($scope);
			element.append(contentElement);
		}
	};
}]);
