TallySheets.factory('Page', ['Config', function(config){
  return function (type){
    var page = {};
    page.heightLeft = config.DataSet.availableHeight;
    page.width = config.DataSet.availableWidth;
    page.contents = [];
    return page;
  }
}]);