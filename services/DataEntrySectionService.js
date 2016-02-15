TallySheets.service("DataEntrySectionService", ['$http','DataElementService', function ($http, DataElementService) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var Section = function(data){
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = [];
        var promises =_.map(data.dataElements, function(incompleteDataElement) {
            return DataElementService.getDataElement(incompleteDataElement).then(function (dataElement) {
                section.dataElements.push(dataElement)
            })
        });
        section.isResolved = Promise.all(promises).then(function(){return true;})
        return section;
    };

    this.getSection = function(section){
        var successPromise = function(response){
            return (new Section(response.data))
        };
        return $http.get(ApiUrl + "/sections/" + section + ".json")
            .then(successPromise, failurePromise)
    };
}]);
