TallySheets.service("DataElementService", ['$http', "OptionSetFactory", function ($http, OptionSetFactory) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var CategoryCombo = function (data) {
        var categoryCombo ={};
        categoryCombo.id = data.id;
        categoryCombo.name = data.name;
        categoryCombo.categoryOptionCombos = _.sortBy(data.categoryOptionCombos, ['name']);
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
        var promises = [];
        dataElement.name = data.name;
        dataElement.id = data.id;
        if(data.optionSetValue){
            promises.push(OptionSetFactory.then(function(optionSets){
                dataElement.options = optionSets[data.optionSet.id].options;
                dataElement.type = 'OPTIONSET';
            }));
        }
        else if(data.valueType == 'BOOLEAN')
            dataElement.type = data.valueType;
        else if(data.valueType == 'NUMBER' || data.valueType == 'INTEGER')
            dataElement.type = data.valueType;
        else
            dataElement.type = 'TEXT';

        if(data.categoryCombo.name != "default")
            promises.push(getCategoryCombo(data.categoryCombo)
                .then(function(categoryCombo){
                    return dataElement.categoryCombo = categoryCombo;
                }));
        dataElement.isResolved = Promise.all(promises);
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