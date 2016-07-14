var CategoryCombination = require('./CategoryCombination.js');
module.exports = function(data) {
    var dataElement = _.pick(data, [ 'id', 'name' ]);
    dataElement.displayFormName = data.displayFormName ? data.displayFormName : data.name;
    if( data.optionSetValue ) {
      dataElement.options = data.optionSet.options;
      dataElement.valueType = 'OPTIONSET';
    }
    else
      dataElement.valueType = determineValueType(data);
    if( data.categoryCombo.name != "default" ) {
      dataElement.categoryCombo = new CategoryCombination(data.categoryCombo)
    }
    return dataElement;
};