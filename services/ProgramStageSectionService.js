TallySheets.service("ProgramStageSectionService", ['$http', 'DataElementService', function ($http, DataElementService) {


    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var Section = function(data){
        var programSection = {};
        programSection.name = data.name;
        programSection.id = data.id;
        programSection.dataElements = new Array(data.programStageDataElements.length);

        var promises = _.map(data.programStageDataElements, function(stageDataElement, index) {
            return getDataElement(stageDataElement.id).then(function(dataElement) {
               return DataElementService.getDataElement(dataElement)
                        .then(function (dataElement) {
                            return dataElement.isResolved.then(function(){
                                return programSection.dataElements[index] = dataElement;
                            });
                        })
            });
        });
        programSection.isResolved = Promise.all(promises)
        return  programSection;
    };

    var getDataElement = function(stageDataElement) {
        var successPromise = function(response){
            return response.data.dataElement;
        };
        return $http.get(ApiUrl + "/programStageDataElements/" + stageDataElement + ".json")
            .then(successPromise, failurePromise)
    }


    this.getStageSection = function(section){
        var successPromise = function(response){
            return (new Section(response.data))
        };
        return $http.get(ApiUrl + "/programStageSections/" + section + ".json")
            .then(successPromise, failurePromise)
    };



}]);
