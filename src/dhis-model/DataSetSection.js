var DataElement = require('./DataElement.js');
module.exports = function(data){
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
