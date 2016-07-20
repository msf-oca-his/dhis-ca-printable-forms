TallySheets.service("DataEntrySectionService", ['$http','DataElementService', function ($http, DataElementService) {
    var failurePromise = function(response){
        alert("Could not connect to DHIS");
    };

    var Section = function(data){
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = new Array(data.dataElements.length);
        section.isCatComb = false;
        var promises =_.map(data.dataElements, function(incompleteDataElement, index) {
            return DataElementService.getDataElement(incompleteDataElement)
                .then(function (dataElement) {
                    return dataElement.isResolved.then(function(){
                        return section.dataElements[index] = dataElement;
                    });
            })
        });
        section.isResolved = Promise.all(promises)
            .then(function(){
                    section.isCatComb = section.dataElements[0].categoryCombo.name != "default";
                    return true;
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
