TallySheets.service('UserService', ['$http', '$q', function($http, $q) {

	var removeEmptyAndDuplicateTemplates = function(templates) {
		return _(templates)
			.filter(_.negate(_.isEmpty))
			.uniqBy('id')
			.value();
	};

	var pluckDataSetsAndPrograms = function(response) {
		var dataSets = _(response.data)
			.map('dataSets')
			.flatten()
			.value();
		var programs = _(response.data)
			.map('programs')
			.flatten()
			.value();

		return _.map([dataSets, programs], removeEmptyAndDuplicateTemplates);
	};

	var getCurrentUsersOrganisationUnitsIncludingDescendants = function() {
		var handleError = function(err) {
			console.log(err);
			return $q.reject(new Error('Fetching user organisation units data failed'));
		};
		return $http.get(ApiUrl + "/me/organisationUnits?includeDescendants=true")
			.catch(handleError)
	};

	this.getDataSetsAndPrograms = function() {
		var handleError = function(err) {
			console.log(err);
			return $q.reject(new Error('Plucking user datasets and programs failed'));
		};
		return getCurrentUsersOrganisationUnitsIncludingDescendants()
			.then(pluckDataSetsAndPrograms)
			.catch(handleError)
	};

}]);  