var Page = function(template) {
	this.contents = [];
	_.assignIn(this, template);
};

TallySheets.factory('DataSetPage', ['Config', function(config) {
	return function DataSetPage() {
		var dataSetPage = {};
		dataSetPage.heightLeft = config.DataSet.availableHeight;
		dataSetPage.widthLeft = config.DataSet.availableWidth;
		dataSetPage.type = "DATASET";
		return new Page(dataSetPage);
	}
}]);

TallySheets.factory('CoverSheetPage', ['Config', function(config) {
	return function CoverSheetPage() {
		var coverSheetPage = {};
		coverSheetPage.heightLeft = config.Coversheet.availableHeight;
		coverSheetPage.widthLeft = config.Coversheet.availableWidth;
		coverSheetPage.type = "COVERSHEET";
		return new Page(coverSheetPage);
	}
}]);

TallySheets.factory('RegisterPage', ['Config', function(config) {
	return function RegisterPage() {
		var registerPage = {};
		registerPage.heightLeft = config.PageTypes.A4.LandScape.availableHeight - config.Register.headerHeight;
		registerPage.widthLeft = config.PageTypes.A4.LandScape.availableWidth;
		registerPage.type = "REGISTER";
		return new Page(registerPage)
	}
}]);

TallySheets.factory('CodeSheetPage', ['Config', function(config) {
	return function CodeSheetPage() {
		var codeSheetPage = {};
		codeSheetPage.heightLeft = config.PageTypes.A4.Portrait.availableHeight;
		codeSheetPage.widthLeft = config.PageTypes.A4.Portrait.availableWidth;
		codeSheetPage.type = "CODESHEET";
		codeSheetPage.columns = new Array(config.CodeSheet.numberOfColumns);
		return new Page(codeSheetPage)
	}
}]);
