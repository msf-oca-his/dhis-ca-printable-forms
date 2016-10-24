TallySheets.factory('Page', ['Config', function(config) {
	return function Page(type) {
		this.heightLeft = (type == "REGISTER") ? config.PageTypes.A4.LandScape.availableHeight - config.Register.headerHeight : config.PageTypes.A4.Portrait.availableHeight;
		this.widthLeft = (type == "REGISTER") ?  config.PageTypes.A4.LandScape.availableWidth : config.PageTypes.A4.Portrait.availableWidth;
		if(type == 'CODESHEET')
			this.columns = new Array(config.CodeSheet.numberOfColumns);
		else
			this.contents = [];
	}
}]);