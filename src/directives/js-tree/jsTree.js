TallySheets.directive('jsTree', ['$timeout', function($timeout) {
	return {
		restrict: 'E',
		template: require('./jsTreeView.html'),
		scope: {
			nodes: '='
		},
		link: function($scope) {

			$scope.$watch('nodes',function() {
				$('#jsTree').jstree({
					'plugins':['checkbox'],
					'core': {
						'data': $scope.nodes
					}
				});

				$('#jsTree').jstree(true).settings.core.data = $scope.nodes;
				$('#jsTree').jstree("refresh")
			})
		}
	};
}]);