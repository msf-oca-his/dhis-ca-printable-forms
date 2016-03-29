TallySheets.service("DataElementService", ['$http', "OptionSetFactory", function ($http, OptionSetFactory) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var CategoryCombo = function (data) {
        var categoryCombo ={};
        categoryCombo.id = data.id;
        categoryCombo.name = data.name;
        categoryCombo.categories = data.categories;
        var getCategoryOptions = function(incompleteCategory){
            var successPromise = function(response){
                return response.data;
            };

            return $http.get(ApiUrl + "/categories/" + incompleteCategory.id + ".json")
                .then(successPromise, failurePromise)
        };
        var promises =_.map(data.categories, getCategoryOptions)
        categoryCombo.isResolved = Promise.all(promises).then(function(categories) {

            var cartesianProductOf = function() {
                return _.reduce(arguments, function(a, b) {
                    return _.flatten(_.map(a, function(x) {
                        return _.map(b, function(y) {
                            return x.concat([y]);
                        });
                    }), true);
                }, [ [] ]);
            };

            categoryCombo.categoryOptionCombos = cartesianProductOf.apply(null, _.map(categories, function(category){
                return _.map(category.categoryOptions,"name");
            }));

            categoryCombo.categoryOptionCombos = (_.map(categoryCombo.categoryOptionCombos, function(combo){
                return _.reduce(combo, function(combostr, option, index, arr){
                    return index == arr.length - 1 ? combostr + option : combostr + option + ",";
                }, "");
            }));
            return categoryCombo;
        });
        //categoryCombo.categoryOptionCombos = _.sortBy(data.categoryOptionCombos, ['name']);
        return categoryCombo;
    };
    var getCategoryCombo = function(incompleteCategoryCombo){
        var successPromise = function(response){
            return (new CategoryCombo(response.data).isResolved)
        };

        return $http.get(ApiUrl + "/categoryCombos/" + incompleteCategoryCombo.id + ".json")
            .then(successPromise, failurePromise)

    };
    var DataElement = function (data) {
        var dataElement = {};
        var promises = [];
        dataElement.name = data.displayFormName ? data.displayFormName : data.name;
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