TallySheets.factory('Page', ['Config', function(config) {
	return function Page(type) {
		this.heightLeft = (type == "REGISTER") ? config.Register.availableHeight - config.Register.headerHeight : config.DataSet.availableHeight;
		this.widthLeft = (type == "REGISTER") ?  config.Register.availableWidth : config.DataSet.availableWidth;
		this.contents = [];
	}
}]);