TallySheets.service("DataSetService", ['$http','DataEntrySectionService','DataElementService', function ($http, DataEntrySectionService, DataElementService) {
    this.getDataSet = function(dataSetId){

        var DataSet = function(data){
            var dataSet = {};
            dataSet.name = data.name;
            dataSet.id = data.id;
            dataSet.sections = [];
            dataSet.orphanDataElements =[];
            var getSections = function(){
                return Promise.all(_.map(data.sections, (function(section){
                    return DataEntrySectionService.getSection(section.id).then(function(section){
                        dataSet.sections.push(section)
                    })
                })));
            };

            var getOrphanDataElements = function(){

                var getDataElementsInSections = function(){
                    return Promise.all(_.map(dataSet.sections,"isResolved"))
                        .then(function(){
                            return _.flatten(_.map(dataSet.sections,"dataElements"));
                        })
                };

                var filterOrphanDataElements = function(dataElementsInSections){
                    var dataElementsInSections_ids = _.map(dataElementsInSections, "id");
                    return _.filter(data.dataElements, function (dataElement) {
                        return !_.includes(dataElementsInSections_ids, dataElement.id)
                    })
                };

                var cookOrphanDataElements = function(dataElements){
                    dataSet.orphanDataElements = [];
                    var promises =_.map(dataElements, function(incompleteDataElement) {
                        return DataElementService.getDataElement(incompleteDataElement).then(function (dataElement) {
                            dataSet.orphanDataElements.push(dataElement)
                        })
                    });
                };
                return getDataElementsInSections()
                    .then(filterOrphanDataElements)
                    .then(cookOrphanDataElements)

            };

            getSections()
                .then(getOrphanDataElements)

            return dataSet;

        };
        var successPromise = function(response){
            return new DataSet(response.data);
        };

        var failurePromise = function(response){
            return {isError: true, status: response.status, statusText: response.statusText}
        };

        return $http.get(ApiUrl + "/dataSets/"+dataSetId+".json")
            .then(successPromise, failurePromise);


    }

}]);
