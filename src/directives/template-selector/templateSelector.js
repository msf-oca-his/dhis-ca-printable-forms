TallySheets.directive('templateSelector', ['TemplateTypes', 'PrintableTemplateService',function(TemplateTypes, PrintableTemplateService) {
		return {
			restrict: 'E',
			template: require('./templateSelectorView.html'),
			scope: {
				loadAfter: '=',
				onChange: '&',
				selectedTemplatesType: '='
			},
			link: function($scope) {

				//TODO:what if none of the condition satisfy
				var getTypeOfTemplate = function(template, PageTypes) {
					if(_.isEmpty(template))
						return;
					if(template.type == TemplateTypes.dataSet)
						return PageTypes.DATASET;
					else if(template.type == TemplateTypes.program)
						return PageTypes.PROGRAM;
				};

				var handleUpdate = function(action, position) {
					if(!$scope.onChange) return;
					$scope.selectedTemplatesType = getTypeOfTemplate($scope.selectedTemplates[0], $scope.$parent.PageTypes);
					$scope.$apply();
					$scope.onChange({selectedTemplates: $scope.selectedTemplates, action: action, position: position});
				};

				$scope.selectorLoaded = false;
				$scope.removeTemplate = function(index) {
					$scope.selectedTemplates.splice(index, 1);
					if($scope.selectedTemplates.length == 1)
						$scope.showMultipleTemplates = false;
					setTimeout(function(){
            handleUpdate('remove', index)
					}, 1);
				};

				$scope.addForm = function() {
					$scope.showMultipleTemplates = true;
					$scope.selectedTemplates.push("");
				};

				$scope.select = function(index) {
					handleUpdate('select', index);
				};

				var assignTemplatesToScope = function(templates) {
					$scope.templates = templates;
					$scope.dataSetTemplates = _(templates)
						                          .filter({type:TemplateTypes.dataSet})
						                          .value()
				};
				
				$scope.loadAfter
					.then(PrintableTemplateService.getTemplates)
					.then(assignTemplatesToScope)
					.catch(function() {});
				$scope.showMultipleTemplates = false;
				$scope.selectedTemplates = [""];
			}

		};
	}]);


