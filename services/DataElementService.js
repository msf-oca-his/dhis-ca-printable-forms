TallySheets.service("DataElementService", ['$http', function ($http) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var CategoryCombo = function (data) {
        var categoryCombo ={};
        categoryCombo.id = data.id;
        categoryCombo.name = data.name;
        categoryCombo.categoryOptionCombos = data.categoryOptionCombos;
        return categoryCombo;
    };
    var getCategoryCombo = function(incompleteCategoryCombo){
        var successPromise = function(response){
            return (new CategoryCombo(response.data))
        };

        return $http.get(ApiUrl + "/categoryCombos/" + incompleteCategoryCombo.id + ".json")
            .then(successPromise, failurePromise)

    };
    var DataElement = function (data) {
        var dataElement = {};
        dataElement.name = data.name;
        dataElement.id = data.id;
        dataElement.type = data.valueType;
        if(data.categoryCombo.name != "default")
            dataElement.isResolved = getCategoryCombo(data.categoryCombo)
                .then(function(categoryCombo){
                    return dataElement.categoryCombo = categoryCombo;
                });
        else
            dataElement.isResolved = Promise.resolve(true);
        return dataElement;

    };
    this.getDataElement = function(incompleteDataElement){
        var successPromise = function(response){
            return (new DataElement(response.data))
        };

        return $http.get(ApiUrl + "/dataElements/" + incompleteDataElement.id + ".json")
            .then(successPromise, failurePromise)

    };

    this.getDataElementFromData = function(data){
        var dataElement = {};
        dataElement.name = data.name;
        dataElement.id = data.id;
        dataElement.type = data.type;
        dataElement.categoryCombo = data.categoryCombo;
        return dataElement;
    }


}]);