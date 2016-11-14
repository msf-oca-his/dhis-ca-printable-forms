TallySheets.directive('content', ['Config', '$compile', function(config, $compile) {
	return {
		restrict: 'E',
		template: '',
		scope: {
			content: '='
		},
		link: function($scope, element) {
			var getElementHTML = function(elementName){
				return "<" + elementName + " content='content.data'></" + elementName + "/>"
			};
			ele = $compile(angular.element(getElementHTML($scope.content.type.renderer)))($scope);
			element.append(ele);
		}
	};
}]);
