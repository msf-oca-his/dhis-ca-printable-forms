var DataSetSection = require("./DataSetSection");
module.exports = function(data) {
  var dataSet = _.pick(data, [ 'name', 'id' ]);
  dataSet.type = "dataset"; //TODO: remove this from model.
  dataSet.isPrintFriendlyProcessed = false; //TODO: check the relavance
  console.log(data.sections.toArray())
  dataSet.sections = _.map(data.sections.toArray(), (function(sectionData) {
    return new DataSetSection(sectionData);
  }));
  console.log(dataSet);
  return dataSet;
};