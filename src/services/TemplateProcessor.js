TallySheets.service('TemplateProcessor', ['$http','$q', function($http,$q) {

	var getAllTemplates = function(response) {
		return _.map(response.data, function(data) {
			return _(data)
				.pick("dataSets", "programs")
				.value()
		});
	};

	var filterEmptyObjects = function(Objects) {
		return _(Objects)
			.filter(_.negate(_.isEmpty))
			.value();
	};

	var getPropertyData = function(objects, propertyName) {
		return _.map(objects, function(object) {
			return _.get(object, propertyName);
		});
	};

	var handleError = function(err) {
		console.log(err);
		return $q.reject(new Error('Fetching user organisation units data failed'));
	};
	
	this.getTemplates = function() {
		return $http.get(ApiUrl + "/me/organisationUnits?includeDescendants=true")
			.then(function(response) {
				var templates = getAllTemplates(response);
				var filteredTemplates = filterEmptyObjects(templates);
				var allDataSets = getPropertyData(filteredTemplates, "dataSets");
				var allPrograms = getPropertyData(filteredTemplates, "programs");
				var dataSets = filterEmptyObjects(allDataSets);
				var programs = filterEmptyObjects(allPrograms);
				return [_.uniqBy(_.flatten(dataSets), 'id'), _.uniqBy(_.flatten(programs), 'id')];
			})
			.catch(handleError)
	};

}]);  