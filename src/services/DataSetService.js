TallySheets.service("DataSetService", [ '$http', 'd2', function($http, d2) {
  var cachedDataSets = [];

  var determineValueType = function(data){
    if( data.valueType == 'BOOLEAN' )
      return 'BOOLEAN';
    else if( data.valueType == 'NUMBER' || data.valueType == 'INTEGER' )
      return 'NUMBER';
    else
      return 'TEXT';
  };

  var CategoryCombo = function(data){
    var categoryCombo = _.pick(data, [ 'id', 'name' ]);
    categoryCombo.categories = _.map(data.categories, function(category){
      return _.pick(category, [ 'id', 'name' ]);
    });
    return categoryCombo;
  };

  var DataElement = function(data){
      var dataElement = _.pick(data, [ 'id', 'name' ]);
      dataElement.displayFormName = data.displayFormName ? data.displayFormName : data.name;
      if( data.optionSetValue ) {
        dataElement.options = data.optionSet.options;
        dataElement.valueType = 'OPTIONSET';
      }
      else
        dataElement.valueType = determineValueType(data);
      if( data.categoryCombo.name != "default" ) {
        dataElement.categoryCombo = new CategoryCombo(data.categoryCombo)
      }
      return dataElement;
  };

  var Section = function(data){
    var section = _.pick(data, [ 'id', 'name' ]);
    section.dataElements = _.map(data.dataElements.toArray(), function(dataElementData) {
        return new DataElement(dataElementData);
    });
    if(section.dataElements[0] && section.dataElements[0].categoryCombo)
      section.isCatComb = true;
    else
      section.isCatComb = false;
    return section;
  };

  var DataSet = function(data) {
    var dataSet = _.pick(data, [ 'name', 'id' ]);
    dataSet.type = "dataset"; //TODO: remove this from model.
    dataSet.isPrintFriendlyProcessed = false; //TODO: check the relavance
    console.log(data.sections.toArray())
    dataSet.sections = _.map(data.sections.toArray(), (function(sectionData) {
      return new Section(sectionData);
    }));
    console.log(dataSet);
    return dataSet;
  };

  var getDataSetFromD2Model = function(dataSetCollection) {
    if(dataSetCollection.size == 0)
      throw "No DataSet with given id found"; //TODO: i18n
    return new DataSet(dataSetCollection.toArray()[0]);
  };

  var cacheDataSet = function(dataSet){
    if( getCachedDataSet(dataSet.id) )
      cachedDataSets.push(dataSet);
  };

  var handleError = function(err) {
    //TODO: pull this out to i18n
    alert("Fetching dataset failed.....");
    console.log('Error while fetching dataset', err);
    //return {isError: true, status: response.status, statusText: response.statusText}
  };

  function getCachedDataSet(dataSetId) {
    var indexOfDataSet = _.indexOf(_.map(cachedDataSets, "id"), dataSetId);
    if(indexOfDataSet == -1)
      return null;
    return cachedDataSets[ indexOfDataSet ];
  }

  this.getDataSet = function(dataSetId) {

    var cachedDataSet = getCachedDataSet(dataSetId);
    if(cachedDataSet)
      return Promise.resolve(cachedDataSet);
    else
      return d2.then(function(d2) {
        return d2.models.dataSets.list({
            paging: false,
            filter: [ 'id:eq:' + dataSetId ],
            fields: 'id, name, sections[ id, name, dataElements[ id, name, valueType, optionSetValue, optionSet[ name, id, options[ name, id ] ], categoryCombo[ id, name, categories[ id, name ] ] ] ]'
          })
          .then(getDataSetFromD2Model)
          .then(cacheDataSet)
          .then(getCachedDataSet(dataSetId))
          .catch(handleError)
      });
  }

} ]);
