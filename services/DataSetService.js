TallySheets.service("DataSetService", ['$http','DataEntrySectionService','DataElementService', function ($http, DataEntrySectionService, DataElementService) {
    var datasets = [];
    this.getDataSet = function(dataSetId){

        var DataSet = function(data){
            var dataSet = {};
            dataSet.name = data.name;
            dataSet.id = data.id;
            dataSet.sections = new Array(data.sections.length);
            dataSet.orphanDataElements =[];
            dataSet.isPrintFriendlyProcessed = false;

            var getSections = function(){
                return Promise.all(_.map(data.sections, (function(section, index){
                    return DataEntrySectionService.getSection(section.id).then(function(section){
                        dataSet.sections[index] =section
                    })
                })));
            };

            var getOrphanDataElements = function(){

                var getDataElementsInSections = function(){
                    return Promise.all(_.map(dataSet.sections,"isResolved"))
                        .then(function(results){
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

            dataSet.isResolved = getSections().then(getOrphanDataElements);

            return dataSet;

        };
        var successPromise = function(response){
            var dataset = new DataSet(response.data);
            if(!_.includes(_.map(datasets,"id"), response.data.id))
                datasets.push(dataset);
            return dataset;
        };

        var failurePromise = function(response){
            return {isError: true, status: response.status, statusText: response.statusText}
        };

        var indexOfDataSet = _.indexOf(_.map(datasets,"id"), dataSetId);
        if(indexOfDataSet == -1)
            return $http.get(ApiUrl + "/dataSets/"+dataSetId+".json")
                .then(successPromise, failurePromise);
        else
            return Promise.resolve(datasets[indexOfDataSet]);alert('cached ds');
    }

}]);
