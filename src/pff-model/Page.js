TallySheets.factory('Page', ['Config', function(config){
  return function Page(type){
    this.heightLeft = config.DataSet.availableHeight;
    this.width = config.DataSet.availableWidth;
    this.contents = [];
  }
}]);