TallySheets.service("DataEntrySectionService", ['$http','DataElementService', function ($http, DataElementService) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var Section = function(data){
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = new Array(data.dataElements.length);
        section.isCatComb = false;
        var promises =_.map(data.dataElements, function(incompleteDataElement, index) {
            return DataElementService.getDataElement(incompleteDataElement).then(function (dataElement) {
                section.dataElements[index] = dataElement;
            })
        });
        section.isResolved = Promise.all(promises)
                                .then(function(){
                                    var promises = _.map(section.dataElements, "isResolved")
                                    return Promise.all(promises).then(function(){
                                        section.isCatComb = !!section.dataElements[0].categoryCombo;
                                        return true;
                                    })
                                });

        return section;
    };


    this.getSection = function(section){
        var successPromise = function(response){
            return (new Section(response.data))
        };
        return $http.get(ApiUrl + "/sections/" + section + ".json")
            .then(successPromise, failurePromise)
    };

    this.getSectionFromData = function(data){
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = data.dataElements;
        section.isCatComb = data.isCatComb;
        section.isDuplicate = data.isDuplicate;
        return section;
    }
}]);
