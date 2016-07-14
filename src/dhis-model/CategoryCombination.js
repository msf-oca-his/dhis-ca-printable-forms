module.exports = function(data){
  if(_.isEmpty(data)) return {};
  var categoryCombo = _.pick(data, [ 'id', 'name' ]);
  categoryCombo.categories = _.map(data.categories, function(category){
    return _.pick(category, [ 'id', 'name' ]);
  });
  return categoryCombo;
};